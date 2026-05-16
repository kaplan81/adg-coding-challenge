import { routes } from './app.routes';

describe('shell routes', () => {
  it('should redirect the empty path to /home', () => {
    const empty = routes.find((route) => route.path === '');
    expect(empty?.redirectTo).toBe('home');
    expect(empty?.pathMatch).toBe('full');
  });

  it('should fall back unknown paths to /home', () => {
    const wildcard = routes.find((route) => route.path === '**');
    expect(wildcard?.redirectTo).toBe('home');
  });

  it('should lazy-load the local home feature for /home', () => {
    const home = routes.find((route) => route.path === 'home');
    expect(home?.loadChildren).toBeInstanceOf(Function);
  });

  it('should compose the prescription remote at /prescriptions through Native Federation', () => {
    const prescriptions = routes.find((route) => route.path === 'prescriptions');
    expect(prescriptions).toBeDefined();
    expect(prescriptions?.loadChildren).toBeInstanceOf(Function);
    const source = prescriptions?.loadChildren?.toString() ?? '';
    expect(source).toContain('loadRemoteModule');
    expect(source).toMatch(/remoteName:\s*['"]prescription['"]/);
    expect(source).toMatch(/exposedModule:\s*['"]\.\/Routes['"]/);
  });
});
