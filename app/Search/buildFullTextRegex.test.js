import test from 'ava';
import { buildFullTextRegex } from './FullTextSearch';

test('should have wildcard if value is empty', (t) => {
  t.deepEqual(buildFullTextRegex(' '), new RegExp('[\\s\\S]*', 'gimy'));
});

test('should build regex for all values', (t) => {
  t.deepEqual(buildFullTextRegex('unit test dashboard'), new RegExp('[\\s\\S]*(unit|test|dashboard)[\\s\\S]*(?!\\1)(unit|test|dashboard)[\\s\\S]*(?!\\1|\\2)(unit|test|dashboard)[\\s\\S]*', 'gimy'));
});
