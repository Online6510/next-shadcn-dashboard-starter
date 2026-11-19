import {test} from 'node:test';
import assert from 'node:assert/strict';
import {friendlyGatewayError} from './ai-errors';

test('payment verification is explained without exposing provider response or keys',()=>{
 const result=friendlyGatewayError({statusCode:403,name:'GatewayInternalServerError',
  message:'AI Gateway requires a valid credit card on file; secret token omitted'});
 assert.equal(result.status,503);
 assert.match(result.error,/төлбөрийн карт/);
 assert.equal(result.error.includes('secret token'),false);
});
test('exhausted credits and rate limits have distinct statuses',()=>{
 assert.equal(friendlyGatewayError({statusCode:402}).status,503);
 assert.equal(friendlyGatewayError({statusCode:429}).status,429);
 assert.equal(friendlyGatewayError({statusCode:401}).status,503);
 assert.equal(friendlyGatewayError(new Error('unknown')).status,502);
});
