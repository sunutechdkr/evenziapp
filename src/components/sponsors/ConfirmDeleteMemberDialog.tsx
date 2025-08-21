'use client';

import * as React from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface Member {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
}

interface ConfirmDeleteMemberDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
}

export function ConfirmDeleteMemberDialog({ 
  member, 
  open, 
  onOpenChange, 
  onConfirm, 
  loading = false 
}: ConfirmDeleteMemberDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <ExclamationTriangleIcon className="h-5 w-5" />
            Confirmer la suppression
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <p className="text-gray-700">
            Êtes-vous sûr de vouloir retirer <strong>{member?.name || `${member?.firstName} ${member?.lastName}`}</strong> de cette organisation ?
          </p>
          {(member?.jobTitle || member?.company) && (
            <p className="text-sm text-gray-500 mt-2">
              {member.jobTitle && <span>{member.jobTitle}</span>}
              {member.jobTitle && member.company && <span> • </span>}
              {member.company && <span>{member.company}</span>}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-3">
            Cette action ne peut pas être annulée.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-r-transparent"></div>
                Suppression...
              </div>
            ) : (
              'Supprimer'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
