package com.haltcharge.repository;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class FavouriteRepository {

    private final JdbcClient jdbcClient;

    public FavouriteRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    public List<Long> findStationIdsByUserId(Long userId) {
        return jdbcClient.sql("SELECT station_id FROM favourites WHERE user_id = :userId")
                .param("userId", userId)
                .query(Long.class)
                .list();
    }

    public void addFavourite(Long userId, Long stationId) {
        jdbcClient.sql("""
            INSERT INTO favourites (user_id, station_id, created_at)
            VALUES (:userId, :stationId, CURRENT_TIMESTAMP)
            ON CONFLICT (user_id, station_id) DO NOTHING
        """)
        .param("userId", userId)
        .param("stationId", stationId)
        .update();
    }

    public void removeFavourite(Long userId, Long stationId) {
        jdbcClient.sql("DELETE FROM favourites WHERE user_id = :userId AND station_id = :stationId")
                .param("userId", userId)
                .param("stationId", stationId)
                .update();
    }

    public boolean isFavourite(Long userId, Long stationId) {
        Integer count = jdbcClient.sql("SELECT count(*) FROM favourites WHERE user_id = :userId AND station_id = :stationId")
                .param("userId", userId)
                .param("stationId", stationId)
                .query(Integer.class)
                .single();
        return count != null && count > 0;
    }
}

