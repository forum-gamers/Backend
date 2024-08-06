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

      ALTER TABLE "Communities" ADD COLUMN "searchVectorName" TSVECTOR;
      ALTER TABLE "Communities" ADD COLUMN "searchVectorDescription" TSVECTOR;
      ALTER TABLE "Communities" ADD COLUMN "nameTrgmSimilarity" FLOAT;
      ALTER TABLE "Communities" ADD COLUMN "descriptionTrgmSimilarity" FLOAT;

      UPDATE "Communities" SET 
        "searchVectorName" = 
          setweight(to_tsvector('english', COALESCE("name", '')), 'A') || 
          setweight(to_tsvector('indonesian', COALESCE("name", '')), 'B'),
        "searchVectorDescription" = 
          setweight(to_tsvector('english', COALESCE("description", '')), 'A') ||
          setweight(to_tsvector('indonesian', COALESCE("description", '')), 'B'),
        "nameTrgmSimilarity" = similarity("name", COALESCE("name", '')),
        "descriptionTrgmSimilarity" = similarity("description", COALESCE("description", ''));

      CREATE INDEX "communities_search_vector_name_idx" ON "Communities" USING gin("searchVectorName");
      CREATE INDEX "communities_search_vector_description_idx" ON "Communities" USING gin("searchVectorDescription");

      CREATE OR REPLACE FUNCTION update_communities_search_vectors() RETURNS TRIGGER AS $$
      BEGIN
        NEW."searchVectorName" := 
          setweight(to_tsvector('english', COALESCE(NEW."name", '')), 'A') || 
          setweight(to_tsvector('indonesian', COALESCE(NEW."name", '')), 'B');
        NEW."searchVectorDescription" := 
          setweight(to_tsvector('english', COALESCE(NEW."description", '')), 'A') ||
          setweight(to_tsvector('indonesian', COALESCE(NEW."description", '')), 'B');
        NEW."nameTrgmSimilarity" := similarity(NEW."name", COALESCE(NEW."name", ''));
        NEW."descriptionTrgmSimilarity" := similarity(NEW."description", COALESCE(NEW."description", ''));
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_communities_search_vectors
      BEFORE INSERT OR UPDATE ON "Communities"
      FOR EACH ROW
      EXECUTE FUNCTION update_communities_search_vectors();
    `);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.sequelize.query(
      `
      DROP TRIGGER IF EXISTS trigger_update_communities_search_vectors ON "Communities";

      DROP FUNCTION IF EXISTS update_communities_search_vectors();

      DROP INDEX IF EXISTS "communities_search_vector_name_idx";
      DROP INDEX IF EXISTS "communities_search_vector_description_idx";

      ALTER TABLE "Communities" DROP COLUMN IF EXISTS "searchVectorName";
      ALTER TABLE "Communities" DROP COLUMN IF EXISTS "searchVectorDescription";
      ALTER TABLE "Communities" DROP COLUMN IF EXISTS "nameTrgmSimilarity";
      ALTER TABLE "Communities" DROP COLUMN IF EXISTS "descriptionTrgmSimilarity";
      `,
    );
  },
};
