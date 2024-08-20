declare module "midtrans-client" {
    interface CoreApiConfig {
      isProduction: boolean;
      serverKey: string;
      clientKey: string;
    }
  
    export interface ChargeResp {
      order_id: string;
      gross_amount: string;
      payment_type: string;
      transaction_time: string;
      fraud_status: string;
      permata_va_number?: string;
      merchant_id: string;
      masked_card?: string;
      signature_key: string;
      status_code: string;
      transaction_id: string;
      transaction_status: TransactionStatus;
      status_message: string;
      va_numbers: VaNumber[];
      actions?:EWalletActionResp[]
    }

    export interface EWalletActionResp {
      name:string
      method:string,
      url:string
    }
  
    export interface VaNumber {
      bank: string;
      va_number: string;
    }
  
    export type TransactionStatus =
      | "authorize"
      | "capture"
      | "settlement"
      | "deny"
      | "pending"
      | "cancel"
      | "refund"
      | "partial_refund"
      | "chargeback"
      | "partial_chargeback"
      | "expire"
      | "failure";
  
    export class CoreApi {
      constructor(config: CoreApiConfig);
  
      charge(payload: ChargeParameter): Promise<ChargeResp>;
  
      transaction = {
        notification(body: ChargeParameter): Promise<ChargeResp>;,
      };
    }
  
    export interface ChargeParameter {
      payment_type: PaymentType;
      transaction_details: TransactionDetail;
      customer_details: CustomerDetail;
      item_details: ItemDetail[];
      bank_transfer?: BankTransferPayload;
    }
  
    export interface BankTransferPayload {
      bank: string;
      free_text?: FreeText;
      description?: string;
    }
  
    export interface FreeText {
      inquiry?: InquiryText[];
    }
  
    export interface InquiryText {
      id?: string;
      en?: string;
    }
  
    export type PaymentType = "bank_transfer" | EnablePayment;
  
    export interface TransactionDetail {
      order_id: string;
      gross_amount: number;
    }
  
    export interface ItemDetail {
      id: string;
      price: number;
      quantity: number;
      name?: string;
      brand?: string;
      category?: string;
      merchant_name?: string;
      url?: string;
    }
  
    export interface Address {
      first_name: string;
      last_name?: string;
      email: string;
      phone: string;
      address?: string;
      city?: string;
      postal_code?: string;
      country_code?: string;
    }
  
    export interface CustomerDetail {
      first_name: string;
      last_name?: string;
      email: string;
      phone?: string;
      billing_address?: Address;
      shipping_address?: Address;
      enabled_payments?: EnablePayment[];
      credit_card?: CreditCard;
      bca_va?: BcaVa;
      bni_va?: Va;
      bri_va?: Va;
      cimb_va?: Va;
      permata_va?: PermataVa;
      shopeepay?: Pay;
      gopay?: Gopay;
      callbacks?: Callbacks;
      uob_ezpay?: Pay;
      expiry?: Expiry;
      page_expiry?: PageExpiry;
      recurring?: Recurring;
    }
  
    export interface BcaVa {
      va_number: string;
      sub_company_code: string;
      free_text: FreeText;
    }
  
    export interface FreeText {
      inquiry: Inquiry[];
      payment: Inquiry[];
    }
  
    export interface Inquiry {
      en: string;
      id: string;
    }
  
    export interface Va {
      va_number: string;
    }
  
    export interface Callbacks {
      finish: string;
    }
  
    export interface CreditCard {
      secure: boolean;
      channel: string;
      bank: string;
      installment: Installment;
      whitelist_bins: string[];
      dynamic_descriptor: DynamicDescriptor;
    }
  
    export interface DynamicDescriptor {
      merchant_name: string;
      city_name: string;
      country_code: string;
    }
  
    export interface Installment {
      required: boolean;
      terms: Terms;
    }
  
    export interface Terms {
      bni: number[];
      mandiri: number[];
      cimb: number[];
      bca: number[];
      offline: number[];
    }
  
    export interface Expiry {
      start_time: string;
      unit: string;
      duration: number;
    }
  
    export interface Gopay {
      enable_callback: boolean;
      callback_url: string;
    }
  
    export interface PageExpiry {
      duration: number;
      unit: string;
    }
  
    export interface PermataVa {
      va_number: string;
      recipient_name: string;
    }
  
    export interface Recurring {
      required: boolean;
      start_time: string;
      interval_unit: string;
    }
  
    export interface Pay {
      callback_url: string;
    }
  
    export type EnablePayment =
      | "credit_card"
      | "cimb_clicks"
      | "bca_klikbca"
      | "bca_klikpay"
      | "bri_epay"
      | "echannel"
      | "permata_va"
      | "bca_va"
      | "bni_va"
      | "bri_va"
      | "cimb_va"
      | "other_va"
      | "gopay"
      | "indomaret"
      | "danamon_online"
      | "akulaku"
      | "shopeepay"
      | "kredivo"
      | "uob_ezpay"
      | "other_qris";
  
    export interface RespForSnap {
      token: string;
      redirect_url: string;
    }
  }
  