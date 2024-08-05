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

      ALTER TABLE "PostComments" ADD COLUMN "searchVector" TSVECTOR;

      ALTER TABLE "PostComments" ADD COLUMN "trgmSimilarity" FLOAT;

      UPDATE "PostComments" SET "searchVector" = 
        setweight(to_tsvector('english', COALESCE("text", '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE("text", '')), 'A');

      CREATE INDEX "post_comments_search_vector_idx" ON "PostComments" USING gin("searchVector");

      CREATE INDEX "post_comments_text_trgm_idx" ON "PostComments" USING gin (text gin_trgm_ops);

      CREATE OR REPLACE FUNCTION update_post_comments_search_vector() RETURNS TRIGGER AS $$
      BEGIN
        NEW."searchVector" := 
          setweight(to_tsvector('english', COALESCE(NEW."text", '')), 'A') ||
          setweight(to_tsvector('indonesian', COALESCE(NEW."text", '')), 'A');

        -- Update similarity score
        NEW."trgmSimilarity" := similarity(NEW."text", COALESCE(NEW."text", ''));

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER trigger_update_post_comments_search_vector
      BEFORE INSERT OR UPDATE ON "PostComments"
      FOR EACH ROW
      EXECUTE FUNCTION update_post_comments_search_vector();
    `);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex(
      'PostComments',
      'post_comments_search_vector_idx',
    );
    await queryInterface.removeIndex(
      'PostComments',
      'post_comments_text_trgm_idx',
    );
    await queryInterface.removeColumn('PostComments', 'searchVector');
    await queryInterface.removeColumn('PostComments', 'trgmSimilarity');
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_post_comments_search_vector ON "PostComments";
      DROP FUNCTION IF EXISTS update_post_comments_search_vector();
    `);
  },
};
