import { RouteObject } from 'react-router-dom';
import Root from './routes/root';
import Home from './routes/home';
import ErrorPage from './routes/error-page';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Root />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />
      }
    ]
  }
];