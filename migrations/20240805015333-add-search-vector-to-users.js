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

      ALTER TABLE "Users" ADD COLUMN "searchVector" TSVECTOR;

      ALTER TABLE "Users" ADD COLUMN "trgmSimilarity" FLOAT;

      -- Update searchVector column with full-text search weights
      UPDATE "Users" SET "searchVector" = 
        setweight(to_tsvector('english', COALESCE("username", '')), 'A') || 
        setweight(to_tsvector('indonesian', COALESCE("username", '')), 'B') ||
        setweight(to_tsvector('english', COALESCE("bio", '')), 'A') ||
        setweight(to_tsvector('indonesian', COALESCE("bio", '')), 'B');

      CREATE INDEX "users_search_vector_idx" ON "Users" USING gin("searchVector");

      CREATE INDEX "users_username_trgm_idx" ON "Users" USING gin (username gin_trgm_ops);
      CREATE INDEX "users_bio_trgm_idx" ON "Users" USING gin (bio gin_trgm_ops);

      CREATE OR REPLACE FUNCTION update_users_search_vector() RETURNS TRIGGER AS $$
      BEGIN
        NEW."searchVector" := 
          setweight(to_tsvector('english', COALESCE(NEW."username", '')), 'A') || 
          setweight(to_tsvector('indonesian', COALESCE(NEW."username", '')), 'B') ||
          setweight(to_tsvector('english', COALESCE(NEW."bio", '')), 'A') ||
          setweight(to_tsvector('indonesian', COALESCE(NEW."bio", '')), 'B');

        NEW."trgmSimilarity" := greatest(
          similarity(NEW."username", COALESCE(NEW."username", '')),
          similarity(NEW."bio", COALESCE(NEW."bio", ''))
        );

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      -- Create trigger to automatically update searchVector and similarity
      CREATE TRIGGER trigger_update_users_search_vector
      BEFORE INSERT OR UPDATE ON "Users"
      FOR EACH ROW
      EXECUTE FUNCTION update_users_search_vector();
    `);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
    await queryInterface.removeIndex('Users', 'users_search_vector_idx');
    await queryInterface.removeIndex('Users', 'users_username_trgm_idx');
    await queryInterface.removeIndex('Users', 'users_bio_trgm_idx');
    await queryInterface.removeColumn('Users', 'searchVector');
    await queryInterface.removeColumn('Users', 'trgmSimilarity');
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS trigger_update_users_search_vector ON "Users";
      DROP FUNCTION IF EXISTS update_users_search_vector();
      DROP EXTENSION IF EXISTS pg_trgm;
    `);
  },
};
