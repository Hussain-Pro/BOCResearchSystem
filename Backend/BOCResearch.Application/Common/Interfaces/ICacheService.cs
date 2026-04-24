using System;
using System.Threading.Tasks;

namespace BOCResearch.Application.Common.Interfaces;

public interface ICacheService
{
    Task<T> GetOrSetAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiration = null);
    void Remove(string key);
}
