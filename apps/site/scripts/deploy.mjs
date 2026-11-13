// 조립된 묶음(dist)을 정적 호스팅용 저장소에 올린다(D-148). GitHub Pages는 그 저장소의 브랜치를 그대로 내준다.
//   node scripts/deploy.mjs --repo <git 주소> [--branch main] [--dir <하위 폴더>] [--message <커밋 메시지>] [--cname <도메인>] [--root-robots] [--fresh] [--dry-run]
// --dir trellis 이면 저장소의 trellis/ 폴더만 dist로 바꾸고 그 밖의 파일은 그대로 둔다(주소는 …/trellis/).
// --dir가 없으면 저장소 전체(.git 제외)를 dist로 바꾼다. --dry-run은 바뀌는 파일 통계만 보이고 커밋 · 푸시하지 않는다.
// --cname trellis.example.com 이면 저장소 맨 위에 CNAME 파일을 쓴다(브랜치로 내주는 Pages가 자기 도메인을 이 파일로 안다).
// --fresh는 그 브랜치의 기록을 잇지 않고 부모 없는 커밋 하나로 바꾼다. 옛 커밋은 전부 사라진다(강제 푸시).
// 받아 둔 옛 머리에서 바뀌지 않았을 때만 덮어쓴다(--force-with-lease). 파일은 평소와 같게 놓인다(--dir 밖의 파일은 그대로 남는다).
// dist는 올릴 주소와 같은 SITE_URL · SITE_BASE로 빌드하고 node scripts/check.mjs를 통과한 것이어야 한다.
// robots.txt는 호스트 루트에 있는 것만 크롤러가 읽는다. --dir로 올리면 묶음의 robots.txt(…/trellis/robots.txt)는
// 읽히지 않으므로 저장소 루트의 robots.txt와 색인 여부가 어긋나면 알린다. --root-robots는 묶음의 robots.txt를
// 저장소 루트에도 쓴다(색인을 열거나 닫을 때. 호스트 전체에 적용되므로 그 저장소에 다른 사이트가 없을 때만 쓴다).
// 올리는 저장소는 공개 저장소다. 커밋의 작성자 · 커밋한 사람은 이 PC의 git 설정이 아니라 공개용 계정으로 적고,
// 그렇게 적혔는지 확인한 뒤에만 푸시한다(scripts/public-author.mjs, D-153).
import { execFileSync } from 'node:child_process';
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assertIdentity, identityEnv, publicAuthor } from '../../../scripts/public-author.mjs';

const DIST = fileURLToPath(new URL('../dist', import.meta.url));
const ROOT = fileURLToPath(new URL('../../..', import.meta.url));

function fail(message) {
  console.error(`배포 중단: ${message}`);
  process.exit(1);
}

const args = process.argv.slice(2);
const value = (name) => {
  const i = args.indexOf(name);
  if (i === -1) return undefined;
  const v = args[i + 1];
  if (!v || v.startsWith('--')) fail(`${name}에 값이 없다`);
  return v;
};
const repo = value('--repo');
const branch = value('--branch') ?? 'main';
const dir = value('--dir')?.replace(/^\/+|\/+$/g, '');
const dryRun = args.includes('--dry-run');
const rootRobots = args.includes('--root-robots');
const fresh = args.includes('--fresh');
const cname = value('--cname');
/** robots.txt가 전체를 막는가(User-agent: * 아래 Disallow: /) */
const closed = (text) => /^Disallow:\s*\/\s*$/m.test(text);

if (!repo)
  fail(
    '저장소 주소가 없다. node scripts/deploy.mjs --repo <git 주소> [--branch main] [--dir <하위 폴더>] [--dry-run]',
  );
if (
  dir !== undefined &&
  (dir === '' || dir.split('/').some((p) => p === '..' || p === '.' || p === '.git'))
)
  fail(`--dir 값이 잘못됐다: ${value('--dir')}`);
for (const file of ['index.html', 'demo/index.html', 'docs/guide/overview/index.html', 'llms.txt'])
  if (!existsSync(join(DIST, file)))
    fail(`dist/${file} 없음. 먼저 pnpm turbo run build --filter=@terracelab/site... 와 check`);

let author;
try {
  author = publicAuthor();
} catch (e) {
  fail(e.message);
}
const identity = identityEnv(author);
const git = (cwd, ...argv) =>
  execFileSync('git', argv, {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    env: identity,
  }).trim();
const tryGit = (cwd, ...argv) => {
  try {
    return git(cwd, ...argv);
  } catch {
    return null;
  }
};

const source = tryGit(ROOT, 'rev-parse', '--short', 'HEAD') ?? '알 수 없음';
const message = value('--message') ?? `site: Trellis 소개 사이트 · 문서 · 데모 (trellis ${source})`;
const work = mkdtempSync(join(tmpdir(), 'trellis-site-deploy-'));
const clone = join(work, 'repo');
let code = 0;
try {
  // 브랜치가 아직 없거나 빈 저장소면 기본 브랜치로 받은 뒤 브랜치를 만든다
  if (tryGit(work, 'clone', '--depth', '1', '--branch', branch, repo, clone) === null) {
    rmSync(clone, { recursive: true, force: true });
    try {
      git(work, 'clone', '--depth', '1', repo, clone);
    } catch (e) {
      throw new Error(`저장소를 받지 못했다(${repo}): ${String(e.stderr ?? e.message).trim()}`, {
        cause: e,
      });
    }
    if (tryGit(clone, 'rev-parse', '--verify', 'HEAD') === null)
      git(clone, 'symbolic-ref', 'HEAD', `refs/heads/${branch}`);
    else git(clone, 'checkout', '-B', branch);
  }

  const target = dir ? join(clone, dir) : clone;
  if (dir) rmSync(target, { recursive: true, force: true });
  else
    for (const entry of readdirSync(clone))
      if (entry !== '.git') rmSync(join(clone, entry), { recursive: true, force: true });
  cpSync(DIST, target, { recursive: true });
  // 밑줄로 시작하는 폴더(_astro)를 내주게 하는 표시는 저장소 맨 위에 있어야 한다
  writeFileSync(join(clone, '.nojekyll'), '');
  if (cname) writeFileSync(join(clone, 'CNAME'), `${cname}\n`);

  // 색인 여부: 크롤러가 읽는 것은 호스트 루트의 robots.txt다
  const bundleRobots = join(DIST, 'robots.txt');
  if (dir && existsSync(bundleRobots)) {
    const mine = readFileSync(bundleRobots, 'utf8');
    const hostFile = join(clone, 'robots.txt');
    if (rootRobots) {
      writeFileSync(hostFile, mine);
      console.log(`루트 robots.txt를 묶음과 같게 썼다(색인 ${closed(mine) ? '막음' : '허용'})`);
    } else {
      const host = existsSync(hostFile) ? readFileSync(hostFile, 'utf8') : '';
      if (closed(mine) !== closed(host))
        console.warn(
          `주의: 묶음은 색인 ${closed(mine) ? '막음' : '허용'}인데 저장소 루트의 robots.txt는 ${closed(host) ? '막음' : '허용'}이다. ` +
            `크롤러는 루트 것만 읽는다. 맞추려면 --root-robots를 붙인다`,
        );
    }
  }

  git(clone, 'add', '-A');
  const same = git(clone, 'status', '--porcelain') === '';
  const where = `${repo} ${branch}${dir ? ` /${dir}/` : ''}`;
  if (same) console.log('변경 없음');
  else {
    const stat = git(clone, 'diff', '--cached', '--stat').split('\n');
    console.log(stat.length > 12 ? ['…', ...stat.slice(-12)].join('\n') : stat.join('\n'));
  }
  if (fresh) {
    // 받은 기록을 버리고 지금 놓인 파일로 커밋 하나를 새로 만든다
    const old = tryGit(clone, 'ls-remote', 'origin', `refs/heads/${branch}`)?.split(/\s/)[0] ?? '';
    if (dryRun) {
      console.log(
        `--dry-run: 커밋 · 푸시하지 않았다(${where}). 올리면 ${old.slice(0, 7) || '(없음)'}까지의 기록이 커밋 하나로 바뀐다`,
      );
    } else {
      rmSync(join(clone, '.git'), { recursive: true, force: true });
      git(clone, 'init', '-q', '-b', branch);
      git(clone, 'remote', 'add', 'origin', repo);
      git(clone, 'add', '-A');
      git(clone, '-c', 'commit.gpgsign=false', 'commit', '-q', '-m', message);
      assertIdentity((...argv) => git(clone, ...argv), author);
      git(
        clone,
        'push',
        ...(old ? [`--force-with-lease=refs/heads/${branch}:${old}`] : []),
        'origin',
        `HEAD:refs/heads/${branch}`,
      );
      console.log(
        `올렸다(기록을 커밋 하나로 바꿨다): ${where} · ${git(clone, 'rev-parse', '--short', 'HEAD')} "${message}" · 작성자 ${author.label}${old ? ` · 바꾼 옛 머리 ${old.slice(0, 7)}` : ''}`,
      );
    }
  } else if (!same) {
    if (dryRun) {
      console.log(`--dry-run: 커밋 · 푸시하지 않았다(${where})`);
    } else {
      git(clone, '-c', 'commit.gpgsign=false', 'commit', '-m', message);
      assertIdentity((...argv) => git(clone, ...argv), author);
      git(clone, 'push', 'origin', `HEAD:refs/heads/${branch}`);
      console.log(
        `올렸다: ${where} · ${git(clone, 'rev-parse', '--short', 'HEAD')} "${message}" · 작성자 ${author.label}`,
      );
    }
  }
} catch (e) {
  console.error(`배포 중단: ${String(e.stderr ?? e.message).trim()}`);
  code = 1;
} finally {
  // 받은 저장소는 남기지 않는다(process.exit는 finally를 건너뛰므로 끝에서 한 번만 부른다)
  rmSync(work, { recursive: true, force: true });
}
process.exit(code);
