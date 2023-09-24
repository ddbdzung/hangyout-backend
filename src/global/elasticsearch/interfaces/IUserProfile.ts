import { IMetadataQueryResponse } from './IMetadataQueryResponse';

export interface IUserProfileResponse extends IMetadataQueryResponse {
  _source: IUserProfile;
}

export interface IUserProfile {
  fullname: string;
  email: string;
  id: string;
  role: string;
  isVerified: boolean;
  isDeactivated: boolean;
}
