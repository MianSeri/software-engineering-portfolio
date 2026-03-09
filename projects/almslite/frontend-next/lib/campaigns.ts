import { apiFetch } from "@/lib/api";

export type Campaign = {
  _id: string;
  nonprofitId?: string;
  title?: string;
  description?: string;
  goalAmount?: number;
  amountRaised?: number;
  status?: string;
  imageUrl?: string;
};

type CampaignListResponse =
  | Campaign[]
  | { campaigns: Campaign[] }
  | { data: Campaign[] };

type CampaignSingleResponse =
  | Campaign
  | { campaign: Campaign }
  | { data: Campaign };

function normalizeCampaignList(data: any): Campaign[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.campaigns)) return data.campaigns;
  if (Array.isArray(data?.data)) return data.data;
  return [];
}

function normalizeCampaign(data: any): Campaign {
  if (data?.campaign) return data.campaign;
  if (data?.data) return data.data;
  return data;
}

// PUBLIC: GET /campaigns
export async function getCampaigns(): Promise<Campaign[]> {
  const data: CampaignListResponse = await apiFetch("/campaigns");
  return normalizeCampaignList(data);
}

// PUBLIC: GET /campaigns/:id
export async function getCampaign(id: string): Promise<Campaign> {
  if (!id || typeof id !== "string") throw new Error("Missing campaign id");
  const cleanId = id.trim();
  if (!cleanId) throw new Error("Missing campaign id");

  const data: CampaignSingleResponse = await apiFetch(`/campaigns/${cleanId}`);
  return normalizeCampaign(data);
}

// PROTECTED: GET /campaigns/mine/list
export async function getMyCampaigns(): Promise<Campaign[]> {
  const data: CampaignListResponse = await apiFetch("/campaigns/mine/list");
  return normalizeCampaignList(data);
}

export type CreateCampaignPayload = {
  title?: string;
  description?: string;
  goalAmount?: number;
  status?: string;
  imageUrl?: string;
  imageFile?: File;
};

// PROTECTED: POST /campaigns
export async function createCampaign(
  payload: CreateCampaignPayload
): Promise<Campaign> {
  const fd = new FormData();

  fd.append("title", payload.title || "");
  fd.append("description", payload.description || "");
  fd.append("goalAmount", String(payload.goalAmount ?? 0));
  fd.append("status", payload.status || "active");

  if (payload.imageUrl) fd.append("imageUrl", payload.imageUrl);
  if (payload.imageFile) fd.append("image", payload.imageFile);

  const data: CampaignSingleResponse = await apiFetch("/campaigns", {
    method: "POST",
    body: fd,
  });

  return normalizeCampaign(data);
}

// PROTECTED: DELETE /campaigns/:id
export async function deleteCampaign(id: string): Promise<any> {
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Missing campaign id");
  }

  return apiFetch(`/campaigns/${id.trim()}`, { method: "DELETE" });
}

export type UpdateCampaignPayload = Partial<{
  title: string;
  description: string;
  goalAmount: number;
  status: string;
  imageUrl: string;
  imageFile: File;
}>;

// PROTECTED: PATCH /campaigns/:id
export async function updateCampaign(
  id: string,
  payload: UpdateCampaignPayload
): Promise<Campaign> {
  if (!id || typeof id !== "string" || !id.trim()) {
    throw new Error("Missing campaign id");
  }

  const fd = new FormData();

  if (payload.title != null) fd.append("title", payload.title);
  if (payload.description != null) fd.append("description", payload.description);
  if (payload.goalAmount != null) fd.append("goalAmount", String(payload.goalAmount));
  if (payload.status != null) fd.append("status", payload.status);
  if (payload.imageUrl != null) fd.append("imageUrl", payload.imageUrl);
  if (payload.imageFile) fd.append("image", payload.imageFile);

  const data: CampaignSingleResponse = await apiFetch(`/campaigns/${id.trim()}`, {
    method: "PATCH",
    body: fd,
  });

  return normalizeCampaign(data);
}