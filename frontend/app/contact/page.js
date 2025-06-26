export const metadata = {
  title: 'Contact & Location | Nails Design',
  description: 'Find our salon location, hours, and contact information. We’re happy to help!',
};

export default function Contact() {
  return (
    <main className="max-w-4xl mx-auto py-12 px-4 md:px-8 text-gray-800">
      <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center">
        Contact & Location
      </h1>

      {/* Map */}
      <div className="mb-10 rounded-lg overflow-hidden shadow-md">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d23622.43195094723!2d-0.16458003036396548!3d51.513173920778605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x48761aaa9d40e3ed%3A0x778a6fb0a09d0bec!2sNails%20Design!5e0!3m2!1sen!2suk!4v1750082933670!5m2!1sen!2suk"
          width="100%"
          height="400"
          allowFullScreen=""
          loading="lazy"
          style={{ border: 0 }}
          title="Nails Design Salon Map"
        ></iframe>
      </div>

      {/* Contact Info */}
      <div className="mb-12 text-center space-y-2 text-base md:text-lg">
        <p><strong>Address:</strong> 25 Porchester Road, London, W2 5DP</p>
        <p>
          <strong>Phone:</strong>{' '}
          <a href="tel:02077920370" className="text-pink-600 hover:underline">
            020 7792 0370
          </a>
        </p>
        <p>
          <strong>Email:</strong>{' '}
          <a href="mailto:info@serenitynails.com" className="text-pink-600 hover:underline">
            info@nailsdesign.com
          </a>
        </p>
        <p><strong>Hours:</strong> Mon–Sat: 10am – 7pm | Sun: 11am - 5pm</p>
      </div>

      {/* FAQ */}
      <section className="mb-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">FAQ</h2>
        <div className="space-y-4">
          {[
            {
              q: 'Do I need to book in advance, or can I walk in?',
              a: 'We welcome walk-ins when we can, but to guarantee your spot (and avoid waiting), it’s best to book your appointment. Our online booking is quick and easy, or you can give us a call. This way we prepare for you and ensure you get our full, unrushed attention.',
            },
            {
              q: 'How long will my manicure/pedicure really last?',
              a: 'Our treatments are designed to be long-lasting. Most of our clients enjoy about 2 weeks of chip-free nails on gel or BIAB manicures (and often even longer with SNS dipping powder or extensions). Regular polish manicures last around a week with proper care. We’ll also give you simple after-care tips so you get the most out of your nails.',
            },
            {
              q: 'What forms of payment do you accept?',
              a: 'We accept cash, cards, and contactless payments.',
            },
          ].map((faq, i) => (
            <details key={i} className="bg-gray-100 p-4 rounded shadow-sm">
              <summary className="font-semibold cursor-pointer">{faq.q}</summary>
              <p className="mt-2 text-gray-700">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Contact Form */}
      <section className="bg-gray-50 p-6 md:p-8 rounded-lg shadow-md">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center">Send Us a Message</h2>
        <form
          action="https://formspree.io/f/xyzjjonw"
          method="POST"
          className="space-y-4"
        >
          <input
            type="text"
            name="name"
            placeholder="Your Name"
            required
            className="w-full p-3 border rounded focus:outline-pink-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            required
            className="w-full p-3 border rounded focus:outline-pink-500"
          />
          <textarea
            name="message"
            rows="5"
            placeholder="Your Message"
            required
            className="w-full p-3 border rounded focus:outline-pink-500"
          ></textarea>
          <button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded text-sm font-medium transition"
          >
            Send Message
          </button>
        </form>
      </section>
    </main>
  );
}
