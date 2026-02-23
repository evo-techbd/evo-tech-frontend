import { Metadata } from "next";
import Link from "next/link";
import {
  FaReact,
  FaNodeJs,
  FaMobile,
  FaShoppingCart,
  FaCode,
  FaDatabase,
  FaServer,
  FaRocket,
} from "react-icons/fa";
import {
  SiNextdotjs,
  SiTypescript,
  SiTailwindcss,
  SiMongodb,
} from "react-icons/si";

export const metadata: Metadata = {
  title: "Web & App Development Services | Evo-Tech BD",
  description:
    "Professional web and mobile application development services. We create modern, responsive, and user-friendly applications using React, Next.js, Node.js, and more.",
};

const WebNAppDevPage = () => {
  const services = [
    {
      icon: FaReact,
      title: "Web Application Development",
      description:
        "Build scalable and high-performance web applications using modern technologies like React, Next.js, and TypeScript.",
      features: [
        "Single Page Applications (SPA)",
        "Progressive Web Apps (PWA)",
        "Server-Side Rendering (SSR)",
        "Static Site Generation (SSG)",
      ],
    },
    {
      icon: FaShoppingCart,
      title: "E-Commerce Solutions",
      description:
        "Complete e-commerce platforms with payment integration, inventory management, and order tracking.",
      features: [
        "Shopping Cart & Checkout",
        "Payment Gateway Integration",
        "Admin Dashboard",
        "Inventory Management",
      ],
    },
    {
      icon: FaServer,
      title: "Backend Development",
      description:
        "Robust and scalable backend systems using Node.js, Express, and modern databases.",
      features: [
        "RESTful API Development",
        "Database Design & Optimization",
        "Authentication & Authorization",
        "Real-time Features with WebSocket",
      ],
    },
  ];

  const technologies = [
    { name: "Next.js", icon: SiNextdotjs, color: "text-black" },
    { name: "React", icon: FaReact, color: "text-cyan-500" },
    { name: "TypeScript", icon: SiTypescript, color: "text-blue-600" },
    { name: "Node.js", icon: FaNodeJs, color: "text-green-600" },
    { name: "Tailwind CSS", icon: SiTailwindcss, color: "text-cyan-400" },
    { name: "MongoDB", icon: SiMongodb, color: "text-green-500" },
  ];

  const projects = [
    {
      title: "E-Commerce Platform",
      description:
        "Full-featured online store with admin panel and payment integration",
      tech: ["Next.js", "MongoDB", "Stripe"],
    },
    {
      title: "Travel Community Platform",
      description: "Social platform for travelers to share stories and connect",
      tech: ["React", "Node.js", "PostgreSQL"],
    },
    {
      title: "Car Wash Booking System",
      description: "Service booking platform with real-time availability",
      tech: ["TypeScript", "Express", "Redis"],
    },
  ];

  const developmentProcess = [
    {
      step: "01",
      title: "Discovery & Planning",
      description:
        "We analyze your requirements and create a detailed project roadmap.",
    },
    {
      step: "02",
      title: "Design & Prototyping",
      description:
        "Creating wireframes and interactive prototypes for your approval.",
    },
    {
      step: "03",
      title: "Development",
      description:
        "Building your application using best practices and modern technologies.",
    },
    {
      step: "04",
      title: "Testing & Deployment",
      description: "Rigorous testing followed by smooth deployment and launch.",
    },
  ];

  return (
    <>
      <div className="w-full bg-gradient-to-b from-stone-50 to-white py-16">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* Services Grid */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                Our Development Services
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                Comprehensive solutions covering all aspects of web and mobile
                development
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="group bg-white rounded-2xl shadow-lg border border-stone-200 p-8 hover:shadow-2xl hover:border-brand-300 transition-all duration-300"
                >
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-stone-900 mb-2">
                        {service.title}
                      </h3>
                      <p className="text-stone-600 text-sm leading-relaxed">
                        {service.description}
                      </p>
                    </div>
                  </div>

                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-3 text-stone-700 text-sm"
                      >
                        <svg
                          className="w-5 h-5 text-green-600 flex-shrink-0"
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
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                Technologies We Use
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                Industry-leading tools and frameworks for building robust
                applications
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {technologies.map((tech, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-md border border-stone-200 p-6 flex flex-col items-center justify-center gap-3 hover:shadow-xl hover:scale-105 transition-all"
                >
                  <tech.icon className={`w-12 h-12 ${tech.color}`} />
                  <span className="text-sm font-semibold text-stone-800">
                    {tech.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Development Process */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                Our Development Process
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                A proven methodology that ensures quality and timely delivery
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {developmentProcess.map((process, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-xl shadow-lg border border-stone-200 p-6 hover:shadow-2xl transition-shadow"
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                    {process.step}
                  </div>
                  <div className="mt-4">
                    <h3 className="text-lg font-bold text-stone-900 mb-2">
                      {process.title}
                    </h3>
                    <p className="text-sm text-stone-600 leading-relaxed">
                      {process.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Projects */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                Recent Projects
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                Examples of successful applications we&apos;ve built
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {projects.map((project, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6 hover:shadow-2xl transition-shadow"
                >
                  <h3 className="text-xl font-bold text-stone-900 mb-3">
                    {project.title}
                  </h3>
                  <p className="text-stone-600 text-sm mb-4 leading-relaxed">
                    {project.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map((tech, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-semibold rounded-full border border-brand-200"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Developer Team Section */}
          <div className="mb-20 bg-gradient-to-br from-stone-900 via-stone-800 to-brand-900 rounded-2xl shadow-2xl overflow-hidden border border-white/10">
            <div className="p-8 sm:p-12">
              <div className="text-center mb-12">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Meet Our Development Team
                </h2>
                <div className="w-24 h-1.5 bg-gradient-to-r from-brand-400 to-brand-600 mx-auto rounded-full"></div>
                <p className="mt-4 text-stone-300 text-lg max-w-2xl mx-auto">
                  Expert full-stack developers committed to delivering
                  excellence
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
                  🚀 Need a custom web or mobile application?
                </p>
                <Link
                  href="https://habiburrahman-web.vercel.app/"
                  className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-brand-600 to-brand-700 text-white font-bold rounded-xl hover:from-brand-700 hover:to-brand-800 transition-all hover:scale-105 shadow-lg hover:shadow-2xl"
                >
                  Contact Our Team
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

          {/* CTA Section */}
          <div className="relative overflow-hidden bg-gradient-to-r from-brand-600 to-brand-700 rounded-2xl p-8 sm:p-12 shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start Your Project?
              </h2>
              <p className="text-white/90 text-lg max-w-2xl mx-auto mb-8">
                Let&apos;s discuss your requirements and turn your vision into
                reality. Get a free consultation and quote today!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact-us"
                  className="group px-10 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-stone-100 transition-all hover:scale-105 shadow-lg inline-flex items-center justify-center gap-2"
                >
                  Get Free Consultation
                  <svg
                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                <Link
                  href="/services"
                  className="px-10 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border-2 border-white/30 hover:bg-white/20 transition-all hover:scale-105 inline-flex items-center justify-center"
                >
                  View All Services
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default WebNAppDevPage;
