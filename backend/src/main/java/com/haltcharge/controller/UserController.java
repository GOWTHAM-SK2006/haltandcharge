package com.haltcharge.controller;

import com.haltcharge.entity.Station;
import com.haltcharge.entity.User;
import com.haltcharge.exception.ResourceNotFoundException;
import com.haltcharge.repository.FavouriteRepository;
import com.haltcharge.repository.StationRepository;
import com.haltcharge.repository.UserRepository;
import com.haltcharge.security.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/me")
public class UserController {

    private final UserRepository userRepository;
    private final FavouriteRepository favouriteRepository;
    private final StationRepository stationRepository;

    public UserController(UserRepository userRepository, FavouriteRepository favouriteRepository, StationRepository stationRepository) {
        this.userRepository = userRepository;
        this.favouriteRepository = favouriteRepository;
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public ResponseEntity<User> getMyProfile(@AuthenticationPrincipal CustomUserDetails user) {
        User u = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        u.setPasswordHash(null); // Never expose hash
        return ResponseEntity.ok(u);
    }

    @PutMapping
    public ResponseEntity<User> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails authUser,
            @RequestBody Map<String, String> body) {
        User u = userRepository.findById(authUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (body.containsKey("fullName")) u.setFullName(body.get("fullName"));
        if (body.containsKey("phoneNumber")) u.setPhoneNumber(body.get("phoneNumber"));
        userRepository.save(u);
        u.setPasswordHash(null);
        return ResponseEntity.ok(u);
    }

    @GetMapping("/favourites")
    public ResponseEntity<List<Station>> getMyFavourites(@AuthenticationPrincipal CustomUserDetails authUser) {
        List<Long> stationIds = favouriteRepository.findStationIdsByUserId(authUser.getId());
        List<Station> stations = stationIds.stream()
                .map(id -> stationRepository.findById(id).orElse(null))
                .filter(s -> s != null)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stations);
    }

    @PostMapping("/favourites/{stationId}")
    public ResponseEntity<Map<String, String>> addFavourite(
            @AuthenticationPrincipal CustomUserDetails authUser,
            @PathVariable Long stationId) {
        favouriteRepository.addFavourite(authUser.getId(), stationId);
        return ResponseEntity.ok(Map.of("message", "Added to favourites"));
    }

    @DeleteMapping("/favourites/{stationId}")
    public ResponseEntity<Map<String, String>> removeFavourite(
            @AuthenticationPrincipal CustomUserDetails authUser,
            @PathVariable Long stationId) {
        favouriteRepository.removeFavourite(authUser.getId(), stationId);
        return ResponseEntity.ok(Map.of("message", "Removed from favourites"));
    }
}

