import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import * as chaiSubSet from 'chai-subset';
import * as deepEqualInAnyOrder from 'deep-equal-in-any-order';
import chaiExclude from 'chai-exclude';
import chaiAlmost = require('chai-almost');

chai
  .use(chaiAlmost())
  .use(chaiAsPromised)
  .use(deepEqualInAnyOrder)
  .use(chaiSubSet)
  .use(chaiExclude);

export const expect = chai.expect;
