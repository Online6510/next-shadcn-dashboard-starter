/**
 * Map actual provider/Gateway failures to safe user-facing Mongolian messages.
 * Do not include raw provider response bodies, tokens or request headers.
 */
export function friendlyGatewayError(error:unknown):{status:number;error:string}{
 const cause=error as {statusCode?:number;message?:string;name?:string} | null;
 const status=cause?.statusCode;
 const detail=typeof cause?.message==='string'?cause.message:'';
 if(status===403 && /credit card|payment method|customer.verification|required|billing/i.test(detail))
  return {status:503,error:'AI үйлчилгээний эзэмшигч Vercel AI Gateway дээр төлбөрийн карт баталгаажуулах шаардлагатай. Одоогоор AI зөвлөгөө өгөх боломжгүй байна.'};
 if(status===402)
  return {status:503,error:'AI Gateway-ийн кредит эсвэл төсвийн хязгаар дууссан байна. Үйлчилгээний эзэмшигчийн тохиргоо шаардлагатай.'};
 if(status===401||status===403)
  return {status:503,error:'AI Gateway-ийн нэвтрэх эрхийг шалгах шаардлагатай байна. Дараа дахин оролдоно уу.'};
 if(status===429)
  return {status:429,error:'AI үйлчилгээ түр ачаалалтай байна. Хэсэг хугацааны дараа дахин оролдоно уу.'};
 if(cause?.name==='TimeoutError'||cause?.name==='AbortError')
  return {status:504,error:'AI хариулах хугацаа хэтэрлээ. Дахин оролдоно уу.'};
 return {status:502,error:'AI үйлчилгээ түр хариу өгөхгүй байна. Дараа дахин оролдоно уу.'};
}
