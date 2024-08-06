'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add altering commands here.
     *
     * Example:
     * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
     */
    await queryInterface.sequelize.query(`
    CREATE EXTENSION IF NOT EXISTS pg_trgm;

    ALTER TABLE "Users" ADD COLUMN "searchVectorUsername" TSVECTOR;
    ALTER TABLE "Users" ADD COLUMN "searchVectorBio" TSVECTOR;

    ALTER TABLE "Users" ADD COLUMN "trgmSimilarityUsername" FLOAT;
    ALTER TABLE "Users" ADD COLUMN "trgmSimilarityBio" FLOAT;

    UPDATE "Users" SET 
      "searchVectorUsername" = 
        setweight(to_tsvector('english', COALESCE("username", '')), 'A') || 
        setweight(to_tsvector('indonesian', COALESCE("username", '')), 'B'),
      "searchVectorBio" = 
        setweight(to_tsvector('english', COALESCE("bio", '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE("bio", '')), 'B'),
      "trgmSimilarityUsername" = similarity(COALESCE("username", ''), COALESCE("username", '')),
      "trgmSimilarityBio" = similarity(COALESCE("bio", ''), COALESCE("bio", ''));

    CREATE INDEX "users_search_vector_username_idx" ON "Users" USING gin("searchVectorUsername");
    CREATE INDEX "users_search_vector_bio_idx" ON "Users" USING gin("searchVectorBio");

    CREATE INDEX "users_username_trgm_idx" ON "Users" USING gin("username" gin_trgm_ops);
    CREATE INDEX "users_bio_trgm_idx" ON "Users" USING gin("bio" gin_trgm_ops);

    CREATE OR REPLACE FUNCTION update_users_search_vectors() RETURNS TRIGGER AS $$
    BEGIN
      NEW."searchVectorUsername" := 
        setweight(to_tsvector('english', COALESCE(NEW."username", '')), 'A') || 
        setweight(to_tsvector('indonesian', COALESCE(NEW."username", '')), 'B');
      NEW."searchVectorBio" := 
        setweight(to_tsvector('english', COALESCE(NEW."bio", '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE(NEW."bio", '')), 'B');

      NEW."trgmSimilarityUsername" := similarity(COALESCE(NEW."username", ''), COALESCE(NEW."username", ''));
      NEW."trgmSimilarityBio" := similarity(COALESCE(NEW."bio", ''), COALESCE(NEW."bio", ''));

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trigger_update_users_search_vectors
    BEFORE INSERT OR UPDATE ON "Users"
    FOR EACH ROW
    EXECUTE FUNCTION update_users_search_vectors();
    `);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.query(`
      DROP EXTENSION IF EXISTS pg_trgm;

      DROP TRIGGER IF EXISTS trigger_update_users_search_vectors ON "Users";

      DROP FUNCTION IF EXISTS update_users_search_vectors();

      DROP INDEX IF EXISTS "users_search_vector_username_idx";
      DROP INDEX IF EXISTS "users_search_vector_bio_idx";
      DROP INDEX IF EXISTS "users_username_trgm_idx";
      DROP INDEX IF EXISTS "users_bio_trgm_idx";

      ALTER TABLE "Users" DROP COLUMN IF EXISTS "searchVectorUsername";
      ALTER TABLE "Users" DROP COLUMN IF EXISTS "searchVectorBio";
      ALTER TABLE "Users" DROP COLUMN IF EXISTS "trgmSimilarityUsername";
      ALTER TABLE "Users" DROP COLUMN IF EXISTS "trgmSimilarityBio";
    `);
  },
};
