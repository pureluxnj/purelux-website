/* Uses the existing residential Formspree endpoint. No automatic retry. */
async function submitCareRequest(endpoint, payload, fetchImpl=fetch) {
  let response;
  try { response=await fetchImpl(endpoint,{method:'POST',body:payload,headers:{Accept:'application/json'}}); }
  catch (_) { return {state:'uncertain',message:'We could not confirm whether your request arrived. To avoid a duplicate, please contact Purelux before trying again. Your details are still available below.'}; }
  if(response.ok) return {state:'accepted'};
  if(response.status>=400&&response.status<500) return {state:'rejected',message:'Your request was not accepted. Please check your details and try again, or contact Purelux for help. Your details have been kept.'};
  return {state:'uncertain',message:'We could not confirm whether your request arrived. To avoid a duplicate, please contact Purelux before trying again. Your details are still available below.'};
}
function prepareCarePayload(form, inquiryId) {
  const payload=new FormData(form);
  const get=k=>String(payload.get(k)||'');
  const supplementary=[
    'Care plan / service: '+get('service_type'),
    'Preferred contact: '+(get('preferred_contact_method')||'No preference'),
    'Priority areas: '+(payload.getAll('focus').join(', ')||'None selected'),
    'Photo instructions: Optional photos by SMS to 862-287-7496. No photos uploaded through this form.',
    'Inquiry reference: '+inquiryId
  ];
  if(!form.querySelector('#moving-fields').hidden&&get('vacancy'))supplementary.push('Occupancy: '+get('vacancy'));
  if(!form.querySelector('#construction-fields').hidden)supplementary.push('Construction work: '+get('construction_work'),'Construction status: '+get('construction_status'));
  payload.set('message_notes',[get('message_notes'),...supplementary].filter(Boolean).join('\n'));
  payload.set('inquiry_reference',inquiryId);
  return payload;
}
if(typeof module!=='undefined')module.exports={submitCareRequest};
