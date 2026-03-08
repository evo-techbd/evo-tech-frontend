"use client";

import { useEffect } from "react";

/**
 * Global component to prevent scroll wheel from changing number input values
 * and handle fraction rounding (round up to next integer)
 * This component should be included once in the root layout
 */
export function PreventNumberScroll() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      
      // Check if the target is a number input and is focused
      if (
        target &&
        target.tagName === "INPUT" &&
        (target as HTMLInputElement).type === "number" &&
        document.activeElement === target
      ) {
        e.preventDefault();
      }
    };

    // Handle input changes to round up fractional values
    const handleNumberInput = (e: Event) => {
      const target = e.target as HTMLInputElement;
      
      if (target.type === "number" && target.value !== "") {
        const value = parseFloat(target.value);
        
        // Check if the value has decimals
        if (!isNaN(value) && value % 1 !== 0) {
          // Round up to next integer
          const roundedValue = Math.ceil(value);
          target.value = roundedValue.toString();
          
          // Trigger change event for frameworks/libraries
          const event = new Event("input", { bubbles: true });
          target.dispatchEvent(event);
        }
      }
    };

    // Set step="1" attribute on all number inputs to hint integer-only
    const setupNumberInputs = () => {
      const numberInputs = document.querySelectorAll('input[type="number"]');
      numberInputs.forEach((input) => {
        const inputElement = input as HTMLInputElement;
        
        // Set step to 1 if not already set (for integer-only inputs)
        if (!inputElement.hasAttribute("step")) {
          inputElement.setAttribute("step", "1");
        }
        
        // Add wheel prevention
        inputElement.addEventListener("wheel", (wheelEvent) => {
          wheelEvent.preventDefault();
        }, { passive: false });
      });
    };

    // Initial setup
    setupNumberInputs();

    // Add event listeners
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("input", handleNumberInput, true);

    // Observer to handle dynamically added number inputs
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.tagName === "INPUT" && (node as HTMLInputElement).type === "number") {
              const input = node as HTMLInputElement;
              if (!input.hasAttribute("step")) {
                input.setAttribute("step", "1");
              }
              input.addEventListener("wheel", (wheelEvent) => {
                wheelEvent.preventDefault();
              }, { passive: false });
            }
            // Check children
            const numberInputs = node.querySelectorAll('input[type="number"]');
            numberInputs.forEach((input) => {
              const inputElement = input as HTMLInputElement;
              if (!inputElement.hasAttribute("step")) {
                inputElement.setAttribute("step", "1");
              }
              inputElement.addEventListener("wheel", (wheelEvent) => {
                wheelEvent.preventDefault();
              }, { passive: false });
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("input", handleNumberInput, true);
      observer.disconnect();
    };
  }, []);

  return null; // This component doesn't render anything
}
