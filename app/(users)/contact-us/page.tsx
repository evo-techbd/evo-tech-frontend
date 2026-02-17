import { Metadata } from "next";
import Link from "next/link";
import { MdEmail, MdPhone, MdLocationOn, MdAccessTime } from "react-icons/md";
import {
  FaFacebook,
  FaWhatsapp,
  FaInstagram,
  FaLinkedin,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Evo-Tech Bangladesh. We're here to help with your queries, orders, and support needs.",
};

const ContactUsPage = () => {
  return (
    <>
      <div className="w-full min-h-[60px] sm:min-h-[68px] bg-gradient-to-br from-stone-950 via-stone-600 via-60% to-stone-900 translate-y-[-60px] sm:translate-y-[-68px] mb-[-60px] sm:mb-[-68px]"></div>

      <div className="w-full bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-12 sm:py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              Contact Us
            </h1>
            <p className="text-lg sm:text-xl text-stone-600 max-w-3xl mx-auto">
              Have questions? We&apos;re here to help. Reach out to us through
              any of the channels below.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            {/* Contact Information Cards */}
            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-full bg-brand-100 flex items-center justify-center mb-4">
                <MdEmail className="w-7 h-7 text-brand-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Email Us
              </h3>
              <p className="text-stone-600 text-sm mb-4">
                Send us an email anytime
              </p>
              <a
                href="mailto:evotech.bd22@gmail.com"
                className="text-brand-600 hover:text-brand-700 font-medium break-all"
              >
                evotech.bd22@gmail.com
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <MdPhone className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Call Us
              </h3>
              <p className="text-stone-600 text-sm mb-4">
                Mon-Sat from 10am to 7pm
              </p>
              <a
                href="tel:+8801799424854"
                className="text-brand-600 hover:text-brand-700 font-medium block"
              >
                +880 1799 424854
              </a>
              <a
                href="tel:+8801761490093"
                className="text-brand-600 hover:text-brand-700 font-medium block"
              >
                +880 1761 490093
              </a>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-stone-200 p-6 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                <MdLocationOn className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-stone-900 mb-2">
                Visit Us
              </h3>
              <p className="text-stone-600 text-sm mb-4">
                Come visit our office
              </p>
              <address className="text-brand-600 not-italic leading-relaxed">
                72/A, Matikata Bazar, Dhaka Cantonment
                <br />
                Dhaka-1206, Bangladesh
              </address>
            </div>
          </div>

          {/* Business Hours and Quick Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                  <MdAccessTime className="w-6 h-6 text-orange-600" />
                </div>
                <h2 className="text-2xl font-bold text-stone-900">
                  Business Hours
                </h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-stone-100">
                  <span className="font-semibold text-stone-700">
                    Saturday - Thursday
                  </span>
                  <span className="text-stone-600">10:00 AM - 7:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="font-semibold text-stone-700">
                    Public Holidays
                  </span>
                  <span className="text-stone-600">By Appointment</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-brand-50 border border-brand-200 rounded-lg">
                <p className="text-sm text-brand-800">
                  <strong>💬 Quick Response:</strong> We typically respond to
                  all inquiries within 24 hours during business days.
                </p>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden">
              <div className="h-full min-h-[400px] bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center">
                <div className="text-center p-6">
                  <MdLocationOn className="w-16 h-16 text-brand-600 mx-auto mb-4" />
                  <p className="text-xl font-bold text-stone-800 mb-2">
                    Visit Our Office
                  </p>
                  <address className="not-italic text-stone-700 leading-relaxed">
                    72/A, Matikata Bazar, Dhaka Cantonment
                    <br />
                    Dhaka-1206, Bangladesh
                  </address>
                  <div className="mt-4 flex flex-col gap-2">
                    <a
                      href="tel:+8801799424854"
                      className="text-brand-600 font-semibold hover:text-brand-700"
                    >
                      📞 +880 1799 424854
                    </a>
                    <a
                      href="mailto:evotech.bd22@gmail.com"
                      className="text-brand-600 font-semibold hover:text-brand-700"
                    >
                      ✉️ evotech.bd22@gmail.comcom
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Section */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-2xl shadow-2xl p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Connect With Us
            </h2>
            <p className="text-stone-300 mb-8 max-w-2xl mx-auto">
              Follow us on social media to stay updated with our latest
              products, services, and special offers.
            </p>

            <div className="flex justify-center gap-4 flex-wrap">
              <a
                href="https://www.facebook.com/EvoTechBD22"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-blue-600 border border-white/20 flex items-center justify-center transition-all group"
                aria-label="Facebook"
              >
                <FaFacebook className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="https://wa.me/+8801799424854"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-green-600 border border-white/20 flex items-center justify-center transition-all group"
                aria-label="WhatsApp"
              >
                <FaWhatsapp className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="#"
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-pink-600 border border-white/20 flex items-center justify-center transition-all group"
                aria-label="Instagram"
              >
                <FaInstagram className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
              <a
                href="#"
                className="w-14 h-14 rounded-full bg-white/10 hover:bg-blue-700 border border-white/20 flex items-center justify-center transition-all group"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ContactUsPage;
