import Link from "next/link";
import { Metadata } from "next";
import {
  FaCube,
  FaCloudUploadAlt,
  FaCalculator,
  FaShoppingCart,
  FaRocket,
  FaCheckCircle,
  FaDollarSign,
  FaHeadset,
  FaStar,
} from "react-icons/fa";
import {
  MdHighQuality,
  MdSpeed,
  MdPrecisionManufacturing,
} from "react-icons/md";

export const metadata: Metadata = {
  title: "Custom 3D Printing Service",
  description:
    "Unleash your creativity with our online 3D printing service. Upload your STL file and receive high-quality 3D printed models at your doorstep.",
};

const ThreeDPrintingPage = () => {
  const steps = [
    {
      icon: FaCube,
      step: 1,
      title: "Design Your 3D Model",
      description:
        "Create your 3D model using any CAD software and export as STL file. You can also download free models from Thingiverse.",
      color: "from-blue-500 to-blue-600",
    },
    {
      icon: FaCloudUploadAlt,
      step: 2,
      title: "Upload Your Model",
      description:
        "Drag & drop your STL file into our uploader or click to browse. We support files up to 100MB.",
      color: "from-purple-500 to-purple-600",
    },
    {
      icon: FaCalculator,
      step: 3,
      title: "Get Instant Quote",
      description:
        "Select material, color, and infill density. Our system calculates the price instantly.",
      color: "from-green-500 to-green-600",
    },
    {
      icon: FaShoppingCart,
      step: 4,
      title: "Place Your Order",
      description:
        "Complete checkout and relax! We&apos;ll deliver your 3D printed parts to your doorstep.",
      color: "from-orange-500 to-orange-600",
    },
  ];

  const materials = [
    {
      name: "PLA",
      fullName: "Polylactic Acid",
      description:
        "Biodegradable, food safe plastic. Best for general purpose prints and decorative items.",
      properties: [
        "Biodegradable",
        "Food Safe",
        "Easy to Print",
        "Low Warping",
      ],
      colors: [
        "White",
        "Black",
        "Red",
        "Blue",
        "Green",
        "Yellow",
        "Orange",
        "Gray",
      ],
      price: "From ৳15/g",
    },
    {
      name: "ABS",
      fullName: "Acrylonitrile Butadiene Styrene",
      description:
        "Strong and durable plastic. Ideal for functional parts and items requiring heat resistance.",
      properties: [
        "High Strength",
        "Heat Resistant",
        "Impact Resistant",
        "Post-processable",
      ],
      colors: ["White", "Black", "Red", "Blue", "Gray"],
      price: "From ৳18/g",
    },
    {
      name: "PETG",
      fullName: "Polyethylene Terephthalate Glycol",
      description:
        "Chemical resistant and strong. Perfect for mechanical parts and outdoor use.",
      properties: ["Chemical Resistant", "UV Resistant", "Strong", "Flexible"],
      colors: ["Clear", "White", "Black", "Blue"],
      price: "From ৳20/g",
    },
    {
      name: "TPU",
      fullName: "Thermoplastic Polyurethane",
      description:
        "Flexible and rubber-like. Great for phone cases, gaskets, and wearables.",
      properties: [
        "Flexible",
        "Durable",
        "Abrasion Resistant",
        "Shock Absorbing",
      ],
      colors: ["White", "Black", "Clear"],
      price: "From ৳25/g",
    },
  ];

  const features = [
    {
      icon: MdSpeed,
      title: "Fast Turnaround",
      description: "3-7 business days delivery",
    },
    {
      icon: MdHighQuality,
      title: "Premium Quality",
      description: "0.1-0.3mm layer resolution",
    },
    {
      icon: FaDollarSign,
      title: "Competitive Pricing",
      description: "Transparent, no hidden costs",
    },
    {
      icon: FaHeadset,
      title: "Expert Support",
      description: "Design optimization help",
    },
    {
      icon: MdPrecisionManufacturing,
      title: "Multiple Materials",
      description: "PLA, ABS, PETG, TPU",
    },
    {
      icon: FaCheckCircle,
      title: "Quality Assured",
      description: "Every print inspected",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/grid-pattern.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 py-16 sm:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-6">
              <FaRocket className="w-4 h-4" />
              <span>Professional 3D Printing Service</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
              Custom 3D Printing
              <br />
              <span className="text-brand-200">Made Easy</span>
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              Transform your ideas into reality. Upload your 3D model, get an
              instant quote, and receive high-quality prints delivered to your
              doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#upload-section"
                className="px-8 py-4 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Upload Your File Now
              </a>
              <Link
                href="/contact-us"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-all"
              >
                Get Custom Quote
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full bg-gradient-to-b from-stone-50 to-white">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* How It Works Section */}
          <div className="py-16 sm:py-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                How It Works
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                Get your custom 3D prints in just 4 simple steps
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((item, index) => (
                <div
                  key={index}
                  className="relative bg-white rounded-2xl shadow-lg border border-stone-100 p-6 hover:shadow-xl transition-all hover:-translate-y-1 group"
                >
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-stone-200"></div>
                  )}
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center">
                    <span className="text-sm font-bold text-stone-500">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-stone-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-stone-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          <div id="upload-section" className="py-16 scroll-mt-24">
            <div className="bg-gradient-to-br from-brand-600 to-brand-700 rounded-3xl shadow-2xl overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 sm:p-12 text-white">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                    Upload Your STL File
                  </h2>
                  <p className="text-white/80 mb-6">
                    Ready to bring your design to life? Upload your 3D model
                    file and get started.
                  </p>
                  <ul className="space-y-3 mb-8">
                    {[
                      "Supports STL, OBJ, 3MF formats",
                      "Max file size: 100MB",
                      "Instant volume calculation",
                      "Multiple uploads supported",
                    ].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <FaCheckCircle className="w-5 h-5 text-brand-200 flex-shrink-0" />
                        <span className="text-white/90">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <p className="text-sm text-white/80">
                      <strong className="text-white">💡 Pro Tip:</strong> Ensure
                      your model is watertight and scaled in millimeters.
                    </p>
                  </div>
                </div>

                <div className="p-8 sm:p-12 bg-white">
                  <div className="border-2 border-dashed border-brand-300 rounded-2xl p-8 bg-brand-50/50 hover:bg-brand-50 transition-colors cursor-pointer text-center group">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-2xl bg-brand-100 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <FaCloudUploadAlt className="w-10 h-10 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-stone-900 mb-2">
                          Drag & Drop your file here
                        </p>
                        <p className="text-sm text-stone-600 mb-4">
                          or click to browse your computer
                        </p>
                        <button className="px-6 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors">
                          Select File
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <p className="text-sm text-amber-800">
                      <strong>⏰ Lead Time:</strong> Due to high demand, orders
                      may take an additional 5-7 days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Materials Section */}
          <div className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                Available Materials
              </h2>
              <p className="text-lg text-stone-600 max-w-2xl mx-auto">
                Choose from our selection of high-quality 3D printing materials
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {materials.map((material, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl shadow-lg border border-stone-100 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-stone-900">
                        {material.name}
                      </h3>
                      <p className="text-sm text-stone-500">
                        {material.fullName}
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-brand-100 text-brand-700 text-sm font-semibold rounded-full">
                      {material.price}
                    </span>
                  </div>
                  <p className="text-stone-600 mb-4 text-sm">
                    {material.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {material.properties.map((prop, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded-md"
                      >
                        {prop}
                      </span>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-stone-100">
                    <p className="text-xs text-stone-500 mb-1">
                      Colors: {material.colors.join(", ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Grid */}
          <div className="py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-4">
                Why Choose Us
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-4 sm:p-6 rounded-2xl bg-white border border-stone-100 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 sm:w-14 sm:h-14 mx-auto mb-3 sm:mb-4 rounded-2xl bg-brand-100 flex items-center justify-center">
                    <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 text-brand-600" />
                  </div>
                  <h3 className="font-semibold text-stone-900 mb-1 text-sm sm:text-base">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-stone-600">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-16">
            <div className="bg-gradient-to-br from-stone-900 to-stone-800 rounded-3xl p-8 sm:p-12 text-center">
              <FaStar className="w-12 h-12 text-yellow-400 mx-auto mb-6" />
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to Start Your Project?
              </h2>
              <p className="text-stone-300 max-w-2xl mx-auto mb-8">
                Join hundreds of satisfied customers who trust us with their 3D
                printing needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#upload-section"
                  className="px-8 py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors"
                >
                  Upload Your Model
                </a>
                <Link
                  href="/contact-us"
                  className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/30 hover:bg-white/20 transition-colors"
                >
                  Contact for Bulk Orders
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ThreeDPrintingPage;
