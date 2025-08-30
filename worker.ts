/**
 * Cloudflare Worker – forwards a contact‑form payload to Mailjet.
 *
 * Expected JSON body:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "+3367676765",
 *   "message": "Hello!"
 * }
 */

export default {
  async fetch(request, env, ctx) {

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          // Optional: cache the pre‑flight for a short time
          "Cache-Control": "max-age=86400"
        }
      });
    }

    // Only accept POST
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    // Parse JSON body
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return new Response("Invalid JSON", { status: 400 });
    }

    const { name, email, phone, message } = data;

    // Very light validation (you can tighten this)
    if (!name || !message || !(email || phone)) {
      return new Response("Missing fields", { status: 400 });
    }

    // Build Mailjet payload
    const mailjetPayload = {
      Messages: [
        {
          From: {
            Email: env.MJ_CONTACT_EMAIL, // verified sender address
            Name: "Website Contact"
          },
          To: [
            {
              Email: env.MJ_CONTACT_EMAIL, // where you want to receive the message
              Name: "Me"
            }
          ],
          Subject: `New contact form message from ${name}`,
          TextPart: `Name: ${name}\nEmail: ${email}\nMessage:\n${message}`,
          HTMLPart: `<p><strong>Name:</strong>${name}<br/>
                     <strong>Email:</strong> ${email}<br/>
                     <strong>Phone:</strong> ${phone}<br/>
                     <strong>Message:</strong><br/>${message
                       .replace(/\n/g, "<br/>")
                       .replace(/</g, "&lt;")
                       .replace(/>/g, "&gt;")}</p>`
        }
      ]
    };

    // Call Mailjet
    const mailjetResponse = await fetch("https://api.mailjet.com/v3.1/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Basic auth: base64(publicKey:privateKey)
        Authorization:
          "Basic " +
          btoa(`${env.MJ_PUBLIC_KEY}:${env.MJ_PRIVATE_KEY}`)
      },
      body: JSON.stringify(mailjetPayload)
    });

    const result = await mailjetResponse.json();

    if (!mailjetResponse.ok) {
      // Forward the error (but hide the raw credentials)
      console.error("Service error:", result);
      return jsonResponse({ success: false, error: "Service failed" },502);
    }

    // Success!
    return jsonResponse({ success: true }, 200);

    function jsonResponse(bodyObj, status = 200) {
      return new Response(JSON.stringify(bodyObj), {
        status,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",          // <-- allow any origin
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type"
        }
      });
    }
  }
};