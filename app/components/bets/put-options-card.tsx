import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { toast } from "sonner";
import type { Database } from "database.types";

export default function PutOptionsCard() {
  const [name, setName] = useState<string>("");

  const handleRequestPutOptions = () => {
    if (!name) {
      toast.error("Missing information", {
        description: "Please select a name",
      });
      return;
    }

    toast.success("Request submitted", {
      description: `Your request to buy put options for ${name} has been submitted`,
    });
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Buy Put Options</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="put-name" className="text-sm font-medium">
            Select Name
          </label>
          <Select value={name} onValueChange={setName}>
            <SelectTrigger id="put-name">
              <SelectValue placeholder="Select a name" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Apple">Apple</SelectItem>
              <SelectItem value="Microsoft">Microsoft</SelectItem>
              <SelectItem value="Amazon">Amazon</SelectItem>
              <SelectItem value="Google">Google</SelectItem>
              <SelectItem value="Tesla">Tesla</SelectItem>
              <SelectItem value="Bitcoin">Bitcoin</SelectItem>
              <SelectItem value="Ethereum">Ethereum</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button className="w-full" onClick={handleRequestPutOptions}>
          Request to buy put options
        </Button>
      </CardContent>
    </Card>
  );
}
