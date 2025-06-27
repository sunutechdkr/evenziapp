"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type TicketFormData = {
  name: string;
  startDate: string;
  endDate: string;
  quantity: string;
  visibility: string;
  type: string;
  price: number;
  group: string;
  description: string;
};

type CreateTicketFormProps = {
  onSubmit: (ticketData: TicketFormData) => void;
  onCancel: () => void;
};

export default function CreateTicketForm({ onSubmit, onCancel }: CreateTicketFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    startDate: "27/06/2025 00:00",
    endDate: "27/07/2025 00:00",
    quantity: "unlimited",
    visibility: "visible",
    type: "free",
    price: 0,
    group: "",
    description: ""
  });

  const [charCount, setCharCount] = useState(0);
  const maxChars = 500;

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDescriptionChange = (value: string) => {
    if (value.length <= maxChars) {
      setCharCount(value.length);
      handleInputChange('description', value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Section L'essentiel */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">L&apos;essentiel</h3>
        <p className="text-sm text-gray-600 mb-6">
          Les billets seront disponibles aux dates spécifiées. Les billets masqués peuvent être 
          accessibles via un lien d&apos;inscription direct ou être sélectionnés dans Studio.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nom du billet */}
          <div className="md:col-span-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700">
              * Nom du billet
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Nom du billet"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Date de début */}
          <div>
            <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
              * Date de début
            </Label>
            <Input
              id="startDate"
              type="text"
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Date de fin */}
          <div>
            <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
              * Date de fin
            </Label>
            <Input
              id="endDate"
              type="text"
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              className="mt-1"
              required
            />
          </div>

          {/* Quantité */}
          <div>
            <Label className="text-sm font-medium text-gray-700">Quantité</Label>
            <Select 
              value={formData.quantity} 
              onValueChange={(value) => handleInputChange('quantity', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Illimité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unlimited">Illimité</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Visibilité du billet */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              * Visibilité du billet
            </Label>
            <div className="mt-2 flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroup 
                  value={formData.visibility} 
                  onValueChange={(value) => handleInputChange('visibility', value)}
                  className="flex space-x-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="visible" id="visible" />
                    <Label 
                      htmlFor="visible" 
                      className="px-4 py-2 border border-[#81B441] bg-[#81B441]/10 text-[#81B441] rounded-md cursor-pointer text-sm"
                    >
                      Visible
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="hidden" id="hidden" />
                    <Label 
                      htmlFor="hidden" 
                      className="px-4 py-2 border border-gray-300 text-gray-600 rounded-md cursor-pointer text-sm hover:border-gray-400"
                    >
                      Masqué
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Type de billet */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Type de billet</h3>
        
        <RadioGroup 
          value={formData.type} 
          onValueChange={(value) => handleInputChange('type', value)}
          className="flex space-x-6"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="free" id="free" />
            <Label 
              htmlFor="free" 
              className="px-6 py-3 border border-[#81B441] bg-[#81B441]/10 text-[#81B441] rounded-md cursor-pointer flex-1 text-center"
            >
              Gratuit
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="paid" id="paid" />
            <Label 
              htmlFor="paid" 
              className="px-6 py-3 border border-gray-300 text-gray-600 rounded-md cursor-pointer flex-1 text-center hover:border-gray-400"
            >
              Payant
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Section Autres paramètres */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Autres paramètres</h3>
        <p className="text-sm text-gray-600 mb-6">
          Choose the group to which attendees purchasing this ticket will be assigned. Groups 
          help manage permissions and communications.
        </p>

        <div className="space-y-4">
          {/* Groupe de l'événement assigné */}
          <div>
            <Label className="text-sm font-medium text-gray-700">
              * Groupe de l&apos;événement assigné
            </Label>
            <Select 
              value={formData.group} 
              onValueChange={(value) => handleInputChange('group', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Sélectionner un groupe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="attendees">Attendees</SelectItem>
                <SelectItem value="speakers">Speakers</SelectItem>
                <SelectItem value="sponsors">Sponsors</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description (optionnel)
            </Label>
            <Textarea
              id="description"
              placeholder="Renseignez une courte description à propos de ce billet"
              value={formData.description}
              onChange={(e) => handleDescriptionChange(e.target.value)}
              className="mt-1 min-h-[120px]"
              maxLength={maxChars}
            />
            <div className="mt-1 text-xs text-gray-500 text-right">
              {charCount}/{maxChars} caractères
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          className="px-6"
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          className="bg-[#81B441] hover:bg-[#72a339] text-white px-6"
        >
          Créer
        </Button>
      </div>
    </form>
  );
} 