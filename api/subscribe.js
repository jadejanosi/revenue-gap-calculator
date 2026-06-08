export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, firstName } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email' });
  }

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes: { FIRSTNAME: firstName || '' },
        listIds: [parseInt(process.env.BREVO_LIST_ID)],
        updateEnabled: true,
        extendedAttributes: { SOURCE: 'Revenue Gap Calculator' }
      })
    });

    if (response.ok || response.status === 204) {
      return res.status(200).json({ success: true });
    }

    const data = await response.json();
    // Contact already exists — still treat as success
    if (data.code === 'duplicate_parameter') {
      return res.status(200).json({ success: true });
    }

    return res.status(500).json({ error: 'Brevo error' });

  } catch (err) {
    console.error('Subscribe error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
