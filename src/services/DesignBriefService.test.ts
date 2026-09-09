import { describe, it, expect } from 'vitest';
import { DesignBriefService, type PoolImage } from './DesignBriefService';

describe('DesignBriefService.appendImagePool', () => {
  it('emits three columns: URL, Description, Credit', () => {
    const images: PoolImage[] = [
      {
        url: 'https://images.unsplash.com/photo-a',
        description: 'A bakery counter',
        author_name: 'Jane Doe',
        author_link: 'https://unsplash.com/@jane?utm_source=wyrd_forge&utm_medium=referral',
      },
    ];

    const result = DesignBriefService.appendImagePool('# DESIGN', images);

    expect(result).toContain('| URL | Description | Credit |');
    expect(result).toContain('| --- | --- | --- |');
  });

  it('emits [Name](link) in Credit when author_link is present', () => {
    const images: PoolImage[] = [
      {
        url: 'https://images.unsplash.com/photo-a',
        description: 'A bakery counter',
        author_name: 'Jane Doe',
        author_link: 'https://unsplash.com/@jane?utm_source=wyrd_forge&utm_medium=referral',
      },
    ];

    const result = DesignBriefService.appendImagePool('# DESIGN', images);

    expect(result).toContain(
      '[Jane Doe](https://unsplash.com/@jane?utm_source=wyrd_forge&utm_medium=referral)',
    );
  });

  it('emits only the name in Credit when author_link is empty', () => {
    const images: PoolImage[] = [
      {
        url: 'https://images.unsplash.com/photo-a',
        description: 'A bakery counter',
        author_name: 'Jane Doe',
        author_link: '',
      },
    ];

    const result = DesignBriefService.appendImagePool('# DESIGN', images);
    const row = result.split('\n').find((l) => l.startsWith('| https://images.unsplash.com/photo-a'));

    expect(row).toBe('| https://images.unsplash.com/photo-a | A bakery counter | Jane Doe |');
    expect(row).not.toContain('[Jane Doe](');
  });

  it('no longer includes "(Photo by" in Description', () => {
    const images: PoolImage[] = [
      {
        url: 'https://images.unsplash.com/photo-a',
        description: 'A bakery counter',
        author_name: 'Jane Doe',
        author_link: 'https://unsplash.com/@jane',
      },
    ];

    const result = DesignBriefService.appendImagePool('# DESIGN', images);

    expect(result).not.toContain('(Photo by');
  });

  it('returns the markdown unchanged for an empty pool, without throwing', () => {
    const markdown = '# DESIGN\n\nSome content.';
    expect(() => DesignBriefService.appendImagePool(markdown, [])).not.toThrow();
    expect(DesignBriefService.appendImagePool(markdown, [])).toBe(markdown);
  });
});
