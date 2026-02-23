import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export default function OrderNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6">
      <Alert className="max-w-md mb-6 border-destructive">
        <AlertTitle className="text-lg text-destructive mb-2 text-center">
          Order Not Found
        </AlertTitle>
        <AlertDescription className="text-muted-foreground text-center">
          {`The order you are looking for doesn't exist or has been deleted.`}
        </AlertDescription>
      </Alert>

      <Button type="button" size="sm" variant="outline" asChild>
        <Link href="/control/orders">
          Back to Orders
        </Link>
      </Button>
    </div>
  );
}
