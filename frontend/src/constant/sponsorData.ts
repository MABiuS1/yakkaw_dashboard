export type Sponsor = {
    id: string | null;
    name: string;
    description: string;
    logo: string;
    category?: string;
    time?: string;
  }

export type SponsorForm = {
    name: string;
    description: string;
    logo: string;
    category: string;
  }

export type SponsorFormDialogProps = {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (e: React.FormEvent) => void;
    Sponsors: {
      id: string | null;
      name: string;
      description: string;
      logo: string;
    };
    setSponsors: (Sponsors: {
      id: string | null;
      name: string;
      description: string;
      logo: string;
    }) => void;
    name: string;
    submitButtonText: string;
  }

export type SponsorsCardProps = {
    Sponsors: Sponsor;
    onEdit: () => void;
    onDelete: () => void;
  }

export type SponsorCardProps = {
    sponsor: Sponsor;
    onEdit: () => void;
    onDelete: () => void;
    onView?: () => void;
  }
