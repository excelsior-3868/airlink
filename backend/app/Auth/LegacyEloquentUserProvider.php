<?php

namespace App\Auth;

use Illuminate\Auth\EloquentUserProvider;
use Illuminate\Contracts\Auth\Authenticatable;

/**
 * Eloquent user provider that transparently verifies legacy PHPMixBill passwords.
 *
 * Legacy hashes come in three flavours:
 *   - MD5-crypt    e.g. $1$W44.ns/.$MUnR0NeBH9xAcXm0Oku2h1   (admin)
 *   - DES-crypt    e.g. wt.gLvRK/LJ6E                         (13-char, many customers)
 *   - plaintext    (very old rows)
 *
 * On the first successful login against any legacy hash, the password is
 * re-hashed to the modern bcrypt/argon scheme and persisted, so each account
 * is upgraded exactly once and Laravel's normal hashing applies thereafter.
 */
class LegacyEloquentUserProvider extends EloquentUserProvider
{
    public function validateCredentials(Authenticatable $user, array $credentials): bool
    {
        $plain = (string) ($credentials['password'] ?? '');
        $hashed = (string) $user->getAuthPassword();

        if ($plain === '' || $hashed === '') {
            return false;
        }

        // Modern hashes -> delegate to the configured hasher.
        if ($this->isModernHash($hashed)) {
            return $this->hasher->check($plain, $hashed);
        }

        // Legacy crypt()/plaintext fallback.
        if ($this->legacyMatches($plain, $hashed)) {
            $this->upgradeHash($user, $plain);

            return true;
        }

        return false;
    }

    /**
     * Laravel calls this after a successful login to upgrade work factors.
     * For legacy hashes the upgrade already happened in validateCredentials();
     * guard against re-hashing those here.
     */
    public function rehashPasswordIfRequired(Authenticatable $user, array $credentials, bool $force = false): void
    {
        if (! $this->isModernHash((string) $user->getAuthPassword())) {
            return;
        }

        parent::rehashPasswordIfRequired($user, $credentials, $force);
    }

    private function isModernHash(string $hash): bool
    {
        return str_starts_with($hash, '$2y$')
            || str_starts_with($hash, '$2a$')
            || str_starts_with($hash, '$2b$')
            || str_starts_with($hash, '$argon2i$')
            || str_starts_with($hash, '$argon2id$');
    }

    private function legacyMatches(string $plain, string $hashed): bool
    {
        // crypt() reproduces the hash when fed the stored value as the salt
        // (works for DES, MD5-crypt $1$, SHA $5$/$6$).
        $computed = crypt($plain, $hashed);
        if (hash_equals($hashed, $computed)) {
            return true;
        }

        // Plaintext legacy rows.
        return hash_equals($hashed, $plain);
    }

    private function upgradeHash(Authenticatable $user, string $plain): void
    {
        $user->forceFill(['password' => $this->hasher->make($plain)]);

        if ($user->exists) {
            $user->save();
        }
    }
}
