import { Metadata } from "next";
import Link from "next/link";
import {
  FaCube,
  FaLaptopCode,
  FaPencilRuler,
  FaLightbulb,
  FaCode,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "Explore our comprehensive range of services including 3D printing, laser engraving, thesis writing, project development, and web & app development.",
};

const ServicesPage = () => {
  const services = [
    {
      icon: FaCube,
      title: "3D Printing Service",
      description:
        "Professional 3D printing services with high-quality results. Upload your STL files and get instant quotations for custom 3D printed parts delivered to your doorstep.",
      features: [
        "Multiple material options (PLA, ABS, PETG, TPU)",
        "Various color choices available",
        "Fast turnaround time (3-7 business days)",
        "Instant online quotation",
      ],
      link: "/products-and-accessories?category=3d-printers",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FaPencilRuler,
      title: "Laser Engraving",
      description:
        "Precision laser engraving services for personalization and branding. We engrave on various materials including wood, acrylic, leather, and metal.",
      features: [
        "High precision engraving",
        "Multiple material support",
        "Custom designs welcome",
        "Perfect for gifts and branding",
      ],
      link: "/products-and-accessories",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: FaLaptopCode,
      title: "Thesis Writing Support",
      description:
        "Expert guidance and support for academic thesis writing. We help students structure, research, and present their academic work professionally.",
      features: [
        "Research methodology guidance",
        "Data analysis support",
        "Academic writing assistance",
        "Formatting and referencing",
      ],
      link: "/contact-us",
      color: "from-green-500 to-green-600",
    },
    {
      icon: FaLightbulb,
      title: "Project Development",
      description:
        "Complete project development services for students and professionals. From concept to completion, we help bring your ideas to life.",
      features: [
        "Embedded systems projects",
        "IoT solutions",
        "Automation projects",
        "Hardware & software integration",
      ],
      link: "/services",
      color: "from-orange-500 to-orange-600",
    },
    {
      icon: FaCode,
      title: "Web & App Development",
      description:
        "Professional web and mobile application development services. We create modern, responsive, and user-friendly applications tailored to your needs.",
      features: [
        "Responsive web design",
        "Mobile app development",
        "E-commerce solutions",
        "Custom software development",
      ],
      link: "/services/web-and-app-development",
      color: "from-red-500 to-red-600",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Our Services
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-3xl mx-auto">
              Comprehensive solutions for all your tech and creative needs. From
              3D printing to web development, we&apos;ve got you covered.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full bg-gradient-to-b from-stone-50 to-white py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Services Grid */}
          <div className="space-y-8">
            {services.map((service, index) => (
              <div
                key={index}
                className="group bg-white rounded-2xl shadow-lg border border-stone-200 overflow-hidden hover:shadow-2xl hover:border-brand-300 transition-all duration-300"
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
                  <div
                    className={`lg:col-span-1 bg-gradient-to-br ${service.color} p-8 sm:p-12 flex flex-col items-center justify-center text-white relative overflow-hidden`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
                    <service.icon className="w-20 h-20 sm:w-24 sm:h-24 mb-6 group-hover:scale-110 transition-transform duration-300" />
                    <h2 className="text-2xl sm:text-3xl font-bold text-center">
                      {service.title}
                    </h2>
                  </div>

                  <div className="lg:col-span-2 p-6 sm:p-10">
                    <p className="text-stone-700 text-base sm:text-lg mb-8 leading-relaxed">
                      {service.description}
                    </p>

                    <div className="mb-8">
                      <h3 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                        <span className="w-1.5 h-6 bg-brand-600 rounded-full"></span>
                        Key Features
                      </h3>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.features.map((feature, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-3 text-stone-600 bg-stone-50 p-3 rounded-lg hover:bg-brand-50 transition-colors"
                          >
                            <svg
                              className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                            <span className="text-sm font-medium">
                              {feature}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Link
                      href={service.link}
                      className="inline-flex items-center gap-2 px-8 py-3.5 bg-brand-600 text-white font-semibold rounded-lg hover:bg-brand-700 transition-all duration-300 hover:gap-3 shadow-md hover:shadow-xl"
                    >
                      Learn More
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Website Developer Info Section */}
          <div className="mt-20 bg-gradient-to-br from-stone-900 via-stone-800 to-brand-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 sm:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Meet Our Development Team
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-brand-400 to-brand-600 mx-auto rounded-full"></div>
                <p className="mt-4 text-stone-300 text-lg max-w-2xl mx-auto">
                  Built with passion by talented full-stack developers from
                  Bangladesh
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-12">
                {/* Developer 1 - Habibur Rahman */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      HR
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Habibur Rahman
                      </h3>
                      <p className="text-brand-400 font-semibold">
                        Full Stack Developer
                      </p>
                      <p className="text-stone-300 text-sm mt-1">
                        Data Science @ UIU
                      </p>
                    </div>
                  </div>

                  <p className="text-stone-200 text-sm leading-relaxed mb-6">
                    Full-stack developer working with React, Next.js, Express,
                    MongoDB, PostgreSQL. Passionate about building data-driven
                    web applications and diving deep into Data Science & Machine
                    Learning.
                  </p>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-stone-400 mb-3 uppercase tracking-wider">
                      Specializations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "React",
                        "Next.js",
                        "TypeScript",
                        "Node.js",
                        "MongoDB",
                        "PostgreSQL",
                        "Python",
                        "Machine Learning",
                      ].map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href="https://github.com/habib-153"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/20 transition-all hover:scale-105 text-center"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://habiburrahman-web.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 text-center"
                    >
                      Portfolio
                    </a>
                    <a
                      href="https://www.linkedin.com/in/habiburrahman153/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/20 transition-all hover:scale-105 text-center"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>

                {/* Developer 2 - Abu Horaira */}
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/15 transition-all duration-300 hover:scale-[1.02]">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                      AH
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-1">
                        Syed Md. Abu Horaira
                      </h3>
                      <p className="text-purple-400 font-semibold">
                        Full Stack Developer
                      </p>
                      <p className="text-stone-300 text-sm mt-1">
                        Zoology @ Dhaka College
                      </p>
                    </div>
                  </div>

                  <p className="text-stone-200 text-sm leading-relaxed mb-6">
                    Aspiring junior web developer with expertise in React, adept
                    in HTML, CSS, JavaScript, TypeScript. Proficient in modern
                    tools like Vite, Express, MongoDB, and Next.js.
                  </p>

                  <div className="mb-6">
                    <p className="text-xs font-semibold text-stone-400 mb-3 uppercase tracking-wider">
                      Specializations
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        "React",
                        "Next.js",
                        "JavaScript",
                        "TypeScript",
                        "Express",
                        "MongoDB",
                        "Vite",
                        "Tailwind CSS",
                      ].map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1.5 bg-white/10 text-white text-xs font-medium rounded-full border border-white/20 hover:bg-white/20 transition-colors"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <a
                      href="https://github.com/Ahnabu"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/20 transition-all hover:scale-105 text-center"
                    >
                      GitHub
                    </a>
                    <a
                      href="https://portfolio-abu-horaira.vercel.app/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-all hover:scale-105 text-center"
                    >
                      Portfolio
                    </a>
                    <a
                      href="https://www.linkedin.com/in/sm-abu-horaira"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg border border-white/20 transition-all hover:scale-105 text-center"
                    >
                      LinkedIn
                    </a>
                  </div>
                </div>
              </div>

              {/* Technologies Stack */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
                <h3 className="text-xl font-semibold text-white mb-4 text-center">
                  💻 Built With Modern Technologies
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {[
                    "Next.js 14",
                    "React 18",
                    "TypeScript",
                    "Node.js",
                    "Express.js",
                    "MongoDB",
                    "PostgreSQL",
                    "Tailwind CSS",
                    "Redux Toolkit",
                    "NextUI",
                    "Radix UI",
                  ].map((tech) => (
                    <span
                      key={tech}
                      className="px-4 py-2 bg-white/10 text-white text-sm font-medium rounded-full border border-white/20 hover:bg-brand-600 hover:border-brand-500 transition-all cursor-default"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-stone-300 mb-6 text-lg">
                  🚀 Interested in similar solutions for your business?
                </p>
                <Link
                  href="https://habiburrahman-web.vercel.app/"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  Get in Touch
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicesPage;
