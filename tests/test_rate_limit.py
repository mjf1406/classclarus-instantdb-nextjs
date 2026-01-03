#!/usr/bin/env python3
"""
Test script to verify rate limiting on Next.js server actions.
This script will spam requests to test if rate limiting is working.
"""

import requests
import time
from typing import Optional

# Configuration
BASE_URL = "http://localhost:3000"  # Change this to your app URL
SERVER_ACTION_ENDPOINT = f"{BASE_URL}/join"  # The join page where actions are called
TEST_PAGE = f"{BASE_URL}/join"  # Alternative: test with page requests

# Rate limit config (from your proxy.ts)
RATE_LIMIT = 5  # requests
TIME_WINDOW = 10  # seconds


def test_server_action_spam(endpoint: str, num_requests: int = 10, delay: float = 0.1):
    """
    Spam a server action endpoint to test rate limiting.
    
    Args:
        endpoint: The endpoint to test
        num_requests: Number of requests to make
        delay: Delay between requests in seconds
    """
    print(f"\n{'='*60}")
    print(f"Testing rate limiting on: {endpoint}")
    print(f"Making {num_requests} requests with {delay}s delay between each")
    print(f"Expected: First {RATE_LIMIT} requests succeed, then rate limited")
    print(f"{'='*60}\n")
    
    success_count = 0
    rate_limited_count = 0
    error_count = 0
    
    for i in range(1, num_requests + 1):
        try:
            # For server actions, we need to make a POST request
            # Next.js server actions expect specific headers and body format
            # This is a simplified test - you may need to adjust based on actual Next.js behavior
            
            # Option 1: Test with POST (server action format)
            # Note: Next.js server actions use a special format, this is a simplified test
            response = requests.post(
                endpoint,
                json={
                    "code": "TESTCODE"  # Invalid code, but will still hit the rate limit
                },
                headers={
                    "Content-Type": "application/json",
                },
                allow_redirects=False,  # Don't follow redirects so we can see the 307/308
                timeout=5
            )
            
            status = response.status_code
            location = response.headers.get("Location", "")
            
            # Check if rate limited
            # Your proxy redirects to /blocked, so we'll see a 307/308 redirect
            if status in [307, 308, 302] and "/blocked" in location:
                rate_limited_count += 1
                print(f"Request {i:2d}: ❌ RATE LIMITED (Status: {status}, Redirect: {location})")
            elif status == 200:
                success_count += 1
                print(f"Request {i:2d}: ✅ SUCCESS (Status: {status})")
            else:
                error_count += 1
                print(f"Request {i:2d}: ⚠️  UNEXPECTED (Status: {status})")
                
        except requests.exceptions.RequestException as e:
            error_count += 1
            print(f"Request {i:2d}: ❌ ERROR - {str(e)}")
        
        # Small delay between requests
        if i < num_requests:
            time.sleep(delay)
    
    print(f"\n{'='*60}")
    print("RESULTS:")
    print(f"  ✅ Successful: {success_count}")
    print(f"  ❌ Rate Limited: {rate_limited_count}")
    print(f"  ⚠️  Errors: {error_count}")
    print(f"{'='*60}\n")
    
    return success_count, rate_limited_count, error_count


def test_page_requests(endpoint: str, num_requests: int = 10, delay: float = 0.1):
    """
    Test rate limiting with simple GET requests to a page.
    This is simpler and more reliable for testing.
    """
    print(f"\n{'='*60}")
    print(f"Testing rate limiting with GET requests to: {endpoint}")
    print(f"Making {num_requests} requests with {delay}s delay between each")
    print(f"Expected: First {RATE_LIMIT} requests succeed, then rate limited")
    print(f"{'='*60}\n")
    
    success_count = 0
    rate_limited_count = 0
    error_count = 0
    
    for i in range(1, num_requests + 1):
        try:
            response = requests.get(
                endpoint,
                allow_redirects=False,  # Don't follow redirects
                timeout=5
            )
            
            status = response.status_code
            location = response.headers.get("Location", "")
            
            # Check if rate limited (redirected to /blocked)
            if status in [307, 308, 302] and "/blocked" in location:
                rate_limited_count += 1
                print(f"Request {i:2d}: ❌ RATE LIMITED (Status: {status}, Redirect: {location})")
            elif status == 200:
                success_count += 1
                print(f"Request {i:2d}: ✅ SUCCESS (Status: {status})")
            else:
                error_count += 1
                print(f"Request {i:2d}: ⚠️  UNEXPECTED (Status: {status})")
                
        except requests.exceptions.RequestException as e:
            error_count += 1
            print(f"Request {i:2d}: ❌ ERROR - {str(e)}")
        
        # Small delay between requests
        if i < num_requests:
            time.sleep(delay)
    
    print(f"\n{'='*60}")
    print("RESULTS:")
    print(f"  ✅ Successful: {success_count}")
    print(f"  ❌ Rate Limited: {rate_limited_count}")
    print(f"  ⚠️  Errors: {error_count}")
    print(f"{'='*60}\n")
    
    return success_count, rate_limited_count, error_count


def test_rapid_fire(endpoint: str, num_requests: int = 10):
    """
    Make rapid-fire requests with no delay to really stress test.
    """
    print(f"\n{'='*60}")
    print(f"RAPID FIRE TEST: {num_requests} requests with NO delay")
    print(f"{'='*60}\n")
    
    import concurrent.futures
    
    def make_request(i: int):
        try:
            response = requests.get(
                endpoint,
                allow_redirects=False,
                timeout=5
            )
            status = response.status_code
            location = response.headers.get("Location", "")
            
            if status in [307, 308, 302] and "/blocked" in location:
                return ("rate_limited", status)
            elif status == 200:
                return ("success", status)
            else:
                return ("other", status)
        except Exception as e:
            return ("error", str(e))
    
    # Make requests concurrently
    with concurrent.futures.ThreadPoolExecutor(max_workers=num_requests) as executor:
        futures = [executor.submit(make_request, i) for i in range(num_requests)]
        results = [f.result() for f in concurrent.futures.as_completed(futures)]
    
    success_count = sum(1 for r in results if r[0] == "success")
    rate_limited_count = sum(1 for r in results if r[0] == "rate_limited")
    error_count = sum(1 for r in results if r[0] == "error")
    
    for i, (result_type, status) in enumerate(results, 1):
        if result_type == "rate_limited":
            print(f"Request {i:2d}: ❌ RATE LIMITED (Status: {status})")
        elif result_type == "success":
            print(f"Request {i:2d}: ✅ SUCCESS (Status: {status})")
        else:
            print(f"Request {i:2d}: ⚠️  {result_type.upper()} (Status: {status})")
    
    print(f"\n{'='*60}")
    print("RESULTS:")
    print(f"  ✅ Successful: {success_count}")
    print(f"  ❌ Rate Limited: {rate_limited_count}")
    print(f"  ⚠️  Errors: {error_count}")
    print(f"{'='*60}\n")
    
    return success_count, rate_limited_count, error_count


if __name__ == "__main__":
    print("\n" + "="*60)
    print("Next.js Rate Limiting Test Script")
    print("="*60)
    print(f"Target URL: {BASE_URL}")
    print(f"Rate Limit: {RATE_LIMIT} requests per {TIME_WINDOW} seconds")
    print("="*60)
    
    # Test 1: Simple page requests (most reliable)
    print("\n📄 TEST 1: Page Requests (GET)")
    test_page_requests(TEST_PAGE, num_requests=10, delay=0.1)
    
    # Wait a bit for rate limit to reset
    print("⏳ Waiting 12 seconds for rate limit to reset...")
    time.sleep(12)
    
    # Test 2: Server action POST requests
    print("\n🔧 TEST 2: Server Action Requests (POST)")
    test_server_action_spam(SERVER_ACTION_ENDPOINT, num_requests=10, delay=0.1)
    
    # Wait again
    print("⏳ Waiting 12 seconds for rate limit to reset...")
    time.sleep(12)
    
    # Test 3: Rapid fire
    print("\n⚡ TEST 3: Rapid Fire (Concurrent Requests)")
    test_rapid_fire(TEST_PAGE, num_requests=10)
    
    print("\n✅ Testing complete!\n")

