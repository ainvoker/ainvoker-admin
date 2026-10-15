import Service from './Service';



const API_URL = import.meta.env.VITE_API_URL;



export type CatalogStatus = 'ACTIVE' | 'INACTIVE' | 'DEPRECATED';

export type RoutableModelType = 'TEXT' | 'IMAGE';

export type ModelType = RoutableModelType | 'AUDIO' | 'MULTIMODAL' | 'EMBEDDING' | 'OTHER';

export type ModelPlanTier = 'ECONOMY' | 'PREMIUM';



export type AdminProvider = {

  id: number;

  name: string;

  baseUrl: string;

  documentation: string | null;

  status: CatalogStatus;

  hasTextAdapter: boolean;

  hasImageAdapter: boolean;

};



export type AdminModel = {

  id: number;

  providerId: number;

  provider: string;

  name: string;

  slug: string;

  type: ModelType;

  contextWindow: number;

  providerInputPrice: string;

  providerOutputPrice: string;

  inputPrice: string;

  outputPrice: string;

  planTier: ModelPlanTier;

  status: CatalogStatus;

  freeEligible: boolean;

  routable: boolean;

  createdAt: string;

  updatedAt: string;

};



export type ModelFilters = {

  type?: RoutableModelType;

  status?: CatalogStatus;

  providerId?: number;

};



export type UpdateModelInput = {

  status?: CatalogStatus;

  planTier?: ModelPlanTier;

  freeEligible?: boolean;

};



export type BusinessSettings = {

  economyMarkupMultiplier: string;

  premiumMarkupMultiplier: string;

  imageMarkupMultiplier: string;

  usdToPhpRate: string;

  quotaReferenceModelId: number | null;

  scaleAdvanceCentavos: number;

  updatedAt: string;

};



export type UpdateBusinessSettingsInput = {

  economyMarkupMultiplier?: number;

  premiumMarkupMultiplier?: number;

  imageMarkupMultiplier?: number;

  usdToPhpRate?: number;

  quotaReferenceModelId?: number | null;

  scaleAdvanceCentavos?: number;

};



class AdminCatalogService extends Service {

  private url(path: string) {

    return `${API_URL}/api/v1/admin${path}`;

  }



  private headers(token: string) {

    return {

      Authorization: `Bearer ${token}`,

      'Content-Type': 'application/json',

    };

  }



  async listProviders(token: string) {

    return this.request<AdminProvider[]>(this.url('/providers'), { headers: this.headers(token) });

  }



  async listModels(token: string, filters: ModelFilters = {}) {

    const params = new URLSearchParams();

    if (filters.type) params.set('type', filters.type);

    if (filters.status) params.set('status', filters.status);

    if (filters.providerId) params.set('providerId', String(filters.providerId));

    const qs = params.toString();

    return this.request<AdminModel[]>(this.url(`/models${qs ? `?${qs}` : ''}`), {

      headers: this.headers(token),

    });

  }



  async updateModel(token: string, modelId: number, patch: UpdateModelInput) {

    return this.request<AdminModel>(this.url(`/models/${modelId}`), {

      method: 'PATCH',

      headers: this.headers(token),

      body: JSON.stringify(patch),

    });

  }



  async getBusinessSettings(token: string) {

    return this.request<BusinessSettings>(this.url('/business-settings'), {

      headers: this.headers(token),

    });

  }



  async updateBusinessSettings(token: string, body: UpdateBusinessSettingsInput) {

    return this.request<{ settings: BusinessSettings; modelsUpdated: number }>(

      this.url('/business-settings'),

      {

        method: 'PUT',

        headers: this.headers(token),

        body: JSON.stringify(body),

      },

    );

  }

}



export default new AdminCatalogService();


