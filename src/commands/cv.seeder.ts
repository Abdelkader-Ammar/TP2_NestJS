import { NestFactory } from '@nestjs/core';
import { rand, randFirstName, randJobTitle, randLastName, randNumber, randUserName } from '@ngneat/falso';
import { AppModule } from '../app.module';
import { AuthService } from '../auth/auth.service';
import { CvService } from '../cv/cv.service';
import { SkillEntity } from '../skill/entities/skill.entity';
import { SkillService } from '../skill/skill.service';
import { ADMIN_ROLE } from '../user/roles';
import { UserService } from '../user/user.service';

const SEED_PASSWORD = 'Password123!';
const ADMIN_USERNAME = 'admin';
const USERS_COUNT = 5;
const CVS_COUNT = 20;
const SKILL_DESIGNATIONS = [
  'TypeScript',
  'NestJS',
  'Angular',
  'Node.js',
  'PostgreSQL',
  'TypeORM',
  'Docker',
  'Git',
  'REST API',
  'Linux',
];

function randomSkillIds(skills: SkillEntity[]): number[] {
  const count = randNumber({ min: 1, max: 4 });
  return Array.from({ length: count }, () => rand(skills).id);
}

function uniqueCin(usedCins: Set<number>): number {
  let cin = randNumber({ min: 10000000, max: 99999999 });
  while (usedCins.has(cin)) cin = randNumber({ min: 10000000, max: 99999999 });
  usedCins.add(cin);
  return cin;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  try {
    const authService = app.get(AuthService);
    const userService = app.get(UserService);
    const skillService = app.get(SkillService);
    const cvService = app.get(CvService);

    if (await userService.findByUsername(ADMIN_USERNAME)) {
      console.log('La base est déjà initialisée, seed ignoré.');
      return;
    }

    const admin = await authService.register({
      username: ADMIN_USERNAME,
      email: 'admin@tp2.local',
      password: SEED_PASSWORD,
    });
    await userService.updateRole(admin.id, ADMIN_ROLE);

    const users = [];
    for (let index = 1; index <= USERS_COUNT; index++) {
      const username = `${randUserName()}${index}`.slice(0, 50);
      users.push(
        await authService.register({ username, email: `${username}@tp2.local`, password: SEED_PASSWORD }),
      );
    }

    const skills: SkillEntity[] = [];
    for (const designation of SKILL_DESIGNATIONS) {
      skills.push(await skillService.create({ designation }));
    }

    const usedCins = new Set<number>();
    for (let index = 0; index < CVS_COUNT; index++) {
      const firstname = randFirstName();
      const name = randLastName();
      await cvService.createForUser(
        {
          name,
          firstname,
          age: randNumber({ min: 20, max: 60 }),
          cin: uniqueCin(usedCins),
          job: randJobTitle(),
          path: `uploads/cvs/${firstname}-${name}.pdf`.toLowerCase().replace(/\s+/g, '-'),
          skillIds: randomSkillIds(skills),
        },
        users[index % users.length],
      );
    }

    console.log(
      `Seed terminé : 1 admin, ${users.length} utilisateurs, ${skills.length} skills, ${CVS_COUNT} cvs. ` +
        `Mot de passe de tous les comptes : ${SEED_PASSWORD}`,
    );
  } finally {
    await app.close();
  }
}

void bootstrap();
