type ClipSavedPayload = {
    id: number;
    content: string;
    edit: string;
};

type ClipUpdatedPayload = {
    id: number;
    content: string;
    edit: string;
};

type ClipDeletedPayload = {
    id: number;
};

export type { ClipSavedPayload, ClipUpdatedPayload, ClipDeletedPayload };