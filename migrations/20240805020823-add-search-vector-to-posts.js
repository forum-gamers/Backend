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

      ALTER TABLE "Posts" ADD COLUMN "searchVector" TSVECTOR;

      ALTER TABLE "Posts" ADD COLUMN "trgmSimilarity" FLOAT;

      UPDATE "Posts" SET "searchVector" = 
        setweight(to_tsvector('english', COALESCE("text", '')), 'A') || 
        setweight(to_tsvector('indonesian', COALESCE("text", '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(ARRAY_TO_STRING("tags", ' '), '')), 'D') ||
        setweight(to_tsvector('indonesian', COALESCE(ARRAY_TO_STRING("tags", ' '), '')), 'D');

      CREATE INDEX "posts_search_vector_idx" ON "Posts" USING gin("searchVector");

      CREATE INDEX "posts_text_trgm_idx" ON "Posts" USING gin (text gin_trgm_ops);

      CREATE OR REPLACE FUNCTION update_posts_search_vector() RETURNS TRIGGER AS $$
      BEGIN
        NEW."searchVector" := 
          setweight(to_tsvector('english', COALESCE(NEW."text", '')), 'A') || 
          setweight(to_tsvector('indonesian', COALESCE(NEW."text", '')), 'A') ||
          setweight(to_tsvector('english', COALESCE(ARRAY_TO_STRING(NEW."tags", ' '), '')), 'D') ||
          setweight(to_tsvector('indonesian', COALESCE(ARRAY_TO_STRING(NEW."tags", ' '), '')), 'D');

        NEW."trgmSimilarity" := greatest(
          similarity(NEW."text", COALESCE(NEW."text", '')),
          similarity(ARRAY_TO_STRING(NEW."tags", ' '), COALESCE(ARRAY_TO_STRING(NEW."tags", ' '), ''))
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_posts_search_vector
      BEFORE INSERT OR UPDATE ON "Posts"
      FOR EACH ROW
      EXECUTE FUNCTION update_posts_search_vector();
    `);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('Posts', 'posts_search_vector_idx');
    await queryInterface.removeIndex('Posts', 'posts_text_trgm_idx');
    await queryInterface.removeColumn('Posts', 'searchVector');
    await queryInterface.removeColumn('Posts', 'trgmSimilarity');
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_posts_search_vector ON "Posts";
      DROP FUNCTION IF EXISTS update_posts_search_vector();
    `);
  },
};
