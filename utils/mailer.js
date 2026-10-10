const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Mail fail zali tari booking thambat nahi
exports.sendBookingMail = async ({ to, name, number, doctorName }) => {
  if (to.endsWith("@test.com")) return; // test accounts la mail nako
  try {
    await transporter.sendMail({
      from: `"Clinic Queue" <${process.env.MAIL_USER}>`,
      to,
      subject: `Your token #${number} is booked`,
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h3>Hi ${name},</h3>
          <p>Tuza token <b style="font-size: 20px;">#${number}</b> book zala aahe.</p>
          <p>Doctor: ${doctorName}</p>
          <p>Live queue pahayla login kara.</p>
        </div>`,
    });
    console.log("Mail sent to", to);
  } catch (err) {
    console.error("Mail failed:", err.message);
  }
};