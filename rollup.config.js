const globals = {
  '@angular/core': 'ng.core',
  'rxjs': 'Rx',
  'rxjs/operators': 'Rx.Observable.prototype',
};

const target = process.env.ROLLUP_TARGET || 'esm';
if (target === 'esm') {
  Object.assign(globals, {
    'tslib': 'tslib',
  });
}

export default {
  input: './dist/nzx-form.js',
  output: {
    file: './dist/bundles/nzx-form.umd.js',
    format: 'umd',
    name: 'nzx-form'
  },
  globals,
  external: Object.keys(globals),
}
