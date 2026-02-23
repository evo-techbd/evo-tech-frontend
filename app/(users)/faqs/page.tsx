"use client";

import React, { useEffect, useState } from "react";
import axios from "@/utils/axios/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ChevronDown } from "lucide-react";

interface FaqData {
    _id: string;
    question: string;
    answer: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

const FaqsPage = () => {
    const [faqs, setFaqs] = useState<FaqData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [openFaqId, setOpenFaqId] = useState<string | null>(null);

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const response = await axios.get("/faqs/active");
                setFaqs(response.data.data || []);
            } catch (error: any) {
                console.error("Error fetching FAQs:", error.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchFaqs();
    }, []);

    const toggleFaq = (id: string) => {
        setOpenFaqId(openFaqId === id ? null : id);
    };

    if (isLoading) {
        return (
            <div className="w-full min-h-screen flex items-center justify-center bg-stone-50">
                <Loader2 className="h-8 w-8 animate-spin text-stone-400" />
            </div>
        );
    }

    return (
        <div className="w-full min-h-screen bg-stone-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-stone-800 mb-3">
                        Frequently Asked Questions
                    </h1>
                    <p className="text-stone-600 text-lg">
                        Find answers to common questions about our products and services.
                    </p>
                </div>

                {faqs.length === 0 ? (
                    <Card className="shadow-lg">
                        <CardContent className="py-12 text-center">
                            <p className="text-stone-600 text-lg">
                                FAQs are currently being updated. Please check back later.
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {faqs.map((faq) => (
                            <div
                                key={faq._id}
                                className="border border-stone-200 rounded-lg overflow-hidden bg-white shadow-sm"
                            >
                                <button
                                    onClick={() => toggleFaq(faq._id)}
                                    className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-stone-50 transition-colors"
                                >
                                    <span className="text-sm md:text-base font-medium text-stone-800 pr-4">
                                        {faq.question}
                                    </span>
                                    <ChevronDown
                                        className={`h-5 w-5 text-stone-500 transition-transform flex-shrink-0 ${openFaqId === faq._id ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>
                                {openFaqId === faq._id && (
                                    <div className="px-6 pb-4 border-t border-stone-100">
                                        <p className="text-sm md:text-base text-stone-600 leading-relaxed pt-4 whitespace-pre-wrap">
                                            {faq.answer}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FaqsPage;
