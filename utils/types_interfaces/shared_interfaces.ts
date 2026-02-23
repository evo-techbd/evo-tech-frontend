// common interfaces used in the project

interface GroupedItems {
    [key: string]: any[];
};

interface BreadCrumbItems {
    content: React.ReactNode;
    href: string;
    beforecontent?: React.ReactNode;
    aftercontent?: React.ReactNode;
};

interface LensProps {
    children: React.ReactNode;
    cursorPosition: { x: number; y: number; };
    zoomFactor?: number;
    lensSize?: number;
}


export type { GroupedItems, BreadCrumbItems, LensProps };
