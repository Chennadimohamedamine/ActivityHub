import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTestUser1707863000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Test user with id: 550e8400-e29b-41d4-a716-446655440001
    // Password: testpassword123
    const testUserId = '550e8400-e29b-41d4-a716-446655440001';
    const hashedPassword = '$2b$10$Aehvheq2ItalWufWX7nVU.2OJ.XdaegFZY.wWSoKBKLC41xCyH5hO';

    await queryRunner.query(
      `INSERT INTO users (id, email, password, role, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW())`,
      [testUserId, 'test@example.com', hashedPassword, 'user'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM users WHERE email = $1`,
      ['test@example.com'],
    );
  }
}
