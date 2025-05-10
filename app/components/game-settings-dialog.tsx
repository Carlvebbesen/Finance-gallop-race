import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export interface GameSettings {
  rounds: number;
  shortMultiplier: number;
  investMultiplier: number;
  callPercent: number;
  putPercent: number;
  callBaseAmount: number;
  putBaseAmount: number;
}

interface GameSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: GameSettings;
  onSaveSettings: (settings: GameSettings) => void;
}

export default function GameSettingsDialog({
  open,
  onOpenChange,
  settings,
  onSaveSettings,
}: GameSettingsDialogProps) {
  const [localSettings, setLocalSettings] = useState<GameSettings>(settings);

  const handleChange = (field: keyof GameSettings, value: string) => {
    const numValue = Number.parseInt(value, 10);
    if (!isNaN(numValue)) {
      setLocalSettings((prev) => ({
        ...prev,
        [field]: numValue,
      }));
    }
  };

  const handleSave = () => {
    onSaveSettings(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Game Settings</DialogTitle>
          <DialogDescription>
            Customize the settings for your game
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="rounds">Rounds</Label>
            <Input
              id="rounds"
              type="number"
              value={localSettings.rounds}
              onChange={(e) => handleChange("rounds", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="shortMultiplier">Short Multiplier</Label>
            <Input
              id="shortMultiplier"
              type="number"
              value={localSettings.shortMultiplier}
              onChange={(e) => handleChange("shortMultiplier", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="investMultiplier">Invest Multiplier</Label>
            <Input
              id="investMultiplier"
              type="number"
              value={localSettings.investMultiplier}
              onChange={(e) => handleChange("investMultiplier", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="callPercent">Call Percent</Label>
            <Input
              id="callPercent"
              type="number"
              value={localSettings.callPercent}
              onChange={(e) => handleChange("callPercent", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="putPercent">Put Percent</Label>
            <Input
              id="putPercent"
              type="number"
              value={localSettings.putPercent}
              onChange={(e) => handleChange("putPercent", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="callBaseAmount">Call Base Amount</Label>
            <Input
              id="callBaseAmount"
              type="number"
              value={localSettings.callBaseAmount}
              onChange={(e) => handleChange("callBaseAmount", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 items-center gap-4">
            <Label htmlFor="putBaseAmount">Put Base Amount</Label>
            <Input
              id="putBaseAmount"
              type="number"
              value={localSettings.putBaseAmount}
              onChange={(e) => handleChange("putBaseAmount", e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
