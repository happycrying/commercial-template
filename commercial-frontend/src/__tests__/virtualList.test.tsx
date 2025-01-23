import { fireEvent, render, screen } from "@testing-library/react";
import Home from "@/app/page";
import "@testing-library/jest-dom";

describe("Virtual List", () => {
  it("should be on the page", () => {
    render(<Home />);

    const virtualList = screen.getByRole("virtualList");

    expect(virtualList).toBeInTheDocument();
  });

  it("should have a maximum of 14 of items inside it", () => {
    render(<Home />);

    const virtualListContainer = screen.getByRole("virtualListContainer");

    console.log(virtualListContainer.childElementCount);

    expect(virtualListContainer.childElementCount).toBeLessThanOrEqual(14);
  });

  it("should have a maximum of 14 of items inside it after a full scroll", async () => {
    render(<Home />);

    const virtualListScrollableContainer = screen.getByRole("virtualList");
    const virtualListElementsContainer = screen.getByRole(
      "virtualListContainer",
    );
    fireEvent.scroll(virtualListScrollableContainer, {
      target: { scrollTop: 800 },
    });
    console.log(virtualListElementsContainer.childElementCount);

    expect(virtualListElementsContainer.childElementCount).toBeLessThanOrEqual(
      14,
    );
  });
});
