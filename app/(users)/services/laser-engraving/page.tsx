import { FaCheckCircle } from "react-icons/fa";
import { GiLaserWarning } from "react-icons/gi";

const LaserEngravingPage = () => {
    const keyFeatures = [
        "High precision engraving",
        "Multiple material support",
        "Custom designs welcome",
        "Perfect for gifts and branding"
    ];

    return (
        <div className="w-full min-h-screen h-fit flex flex-col items-center font-inter">
            <div className="flex flex-col items-center justify-end w-full h-[250px] md:h-[300px] pt-[90px] sm:pt-[98px] pb-10 bg-gradient-to-br from-stone-950 via-stone-600 via-60% to-stone-900 translate-y-[-60px] sm:translate-y-[-68px] mb-[-60px] sm:mb-[-68px]">
                <h1 className="w-fit h-fit px-4 py-4 text-[17px] sm:text-[19px] leading-7 md:text-2xl font-[500] text-stone-100 first-letter:text-[22px] md:first-letter:text-[30px] first-letter:text-sky-400">Laser Engraving</h1>
            </div>

            <div className="max-w-[1200px] w-full px-4 sm:px-6 py-12">
                {/* Main Feature Card */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
                    <div className="grid grid-cols-1 md:grid-cols-2">
                        {/* Left Side - Icon/Visual */}
                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-12 flex items-center justify-center">
                            <div className="text-white text-center">
                                <GiLaserWarning className="w-24 h-24 mx-auto mb-4" />
                                <h2 className="text-3xl font-bold">Laser Engraving</h2>
                            </div>
                        </div>

                        {/* Right Side - Content */}
                        <div className="p-8 bg-stone-50">
                            <p className="text-stone-700 mb-6 leading-relaxed">
                                Precision laser engraving services for personalization and branding. We engrave on various materials
                                including wood, acrylic, leather, and metal.
                            </p>

                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                                    <span className="text-purple-600">│</span> Key Features
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {keyFeatures.map((feature, index) => (
                                        <div key={index} className="flex items-center gap-2">
                                            <FaCheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                            <span className="text-sm text-stone-700">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <a
                                href="https://www.facebook.com/mergein.bd25"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-white font-semibold rounded-lg hover:bg-cyan-600 transition-colors shadow-md hover:shadow-lg"
                            >
                                Learn More →
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default LaserEngravingPage;
