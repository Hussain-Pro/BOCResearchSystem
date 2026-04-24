using System;
using System.Threading.Tasks;
using BOCResearch.Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Memory;

namespace BOCResearch.Infrastructure.Services;

public class CacheService : ICacheService
{
    private readonly IMemoryCache _cache;
    private static readonly TimeSpan DefaultExpiration = TimeSpan.FromMinutes(30);

    public CacheService(IMemoryCache cache)
    {
        _cache = cache;
    }

    public async Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null)
    {
        if (_cache.TryGetValue(key, out T? result))
        {
            return result!;
        }

        result = await factory();

        var options = new MemoryCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = expiration ?? DefaultExpiration
        };

        _cache.Set(key, result, options);

        return result!;
    }

    public void Remove(string key)
    {
        _cache.Remove(key);
    }
}
