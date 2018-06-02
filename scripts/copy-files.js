import fs from 'fs-extra';

const filesToCopy = ['LICENSE', 'README.md', 'package.json'];

try {
  filesToCopy.forEach(fileName => {
    fs.copySync(
      `${process.cwd()}/${fileName}`,
      `${process.cwd()}/build/${fileName}`
    );
  });
} catch (e) {
  console.error(e);
  process.exit(1);
}
