from playwright.sync_api import sync_playwright

def verify_layout():
    with sync_playwright() as p:
        browser = p.chromium.launch()
        page = browser.new_page()
        try:
            page.goto("http://localhost:5173")

            # Wait for the chat interface to be visible
            # ChatInterface has "AI Assistant" text
            page.wait_for_selector("text=AI Assistant")

            # Take a screenshot
            page.screenshot(path="verification/layout_screenshot.png")
            print("Screenshot taken at verification/layout_screenshot.png")

        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()

if __name__ == "__main__":
    verify_layout()
