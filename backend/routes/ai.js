const express = require('express');
const OpenAI = require('openai');
const db = require('../database');
const verifyToken = require('../middleware/auth');

const router = express.Router();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Get pharmacy context from database
const getPharmacyContext = () => {
    return new Promise((resolve, reject) => {
        db.query(
            `SELECT m.id, m.brand_name, m.dosage, m.form, m.stock,
            m.purchase_price, m.selling_price, m.expiry,
            ai.name as ingredient_name,
            s.name as supplier_name,
            DATEDIFF(m.expiry, CURDATE()) as days_until_expiry
            FROM medications m
            JOIN active_ingredients ai ON m.ingredient_id = ai.id
            LEFT JOIN suppliers s ON m.supplier_id = s.id
            ORDER BY m.expiry ASC`,
            (err, medications) => {
                if (err) return reject(err);

                // Format for AI context
                const inStock = medications.filter(m => m.stock > 0)
                const lowStock = medications.filter(m => m.stock <= 15)
                const expiringSoon = medications.filter(m => m.days_until_expiry <= 90)

                const context = `
You are PharmaCare AI, an expert pharmacy assistant integrated into a pharmacy management system.
You are talking to a licensed pharmacist or pharmacy administrator.
You have full access to the pharmacy's current inventory and must use it in your responses.
Never say "consult a doctor" or "consult a pharmacist" — you ARE the pharmacy expert system.
Always be specific, professional, and actionable.
When suggesting medications, always reference what is actually available in the pharmacy stock.
When a medication is expiring soon, always recommend selling or using that batch first (FEFO — First Expiry First Out).

CURRENT PHARMACY INVENTORY:
${inStock.map(m => `- ${m.brand_name} (${m.ingredient_name}) | ${m.dosage} | ${m.form} | Stock: ${m.stock} units | Sell: $${m.selling_price} | Expires: ${new Date(m.expiry).toLocaleDateString()} (${m.days_until_expiry} days) | Supplier: ${m.supplier_name || 'N/A'}`).join('\n')}

LOW STOCK ALERTS (≤15 units):
${lowStock.length > 0 ? lowStock.map(m => `- ${m.brand_name} (${m.ingredient_name}): ${m.stock} units remaining`).join('\n') : 'None'}

EXPIRING SOON (within 90 days):
${expiringSoon.length > 0 ? expiringSoon.map(m => `- ${m.brand_name} (${m.ingredient_name}): expires in ${m.days_until_expiry} days (${new Date(m.expiry).toLocaleDateString()})`).join('\n') : 'None'}
`
                resolve(context)
            }
        )
    })
}

router.post('/chat', verifyToken, async (req, res) => {
    const { message, history } = req.body

    if (!message) {
        return res.status(400).json({ error: 'Message is required' })
    }

    try {
        const pharmacyContext = await getPharmacyContext()

        const messages = [
            { role: 'system', content: pharmacyContext },
            ...(history || []),
            { role: 'user', content: message }
        ]

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages,
            max_tokens: 1000,
            temperature: 0.7
        })

        const reply = completion.choices[0].message.content

        res.json({ reply })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'AI service error' })
    }
})

module.exports = router