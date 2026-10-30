import unittest

from addsearch import add_search

class TestAddSearch(unittest.TestCase):

    def test_valid_search(self):

        self.assertTrue(add_search("calculus notes"))

    def test_empty_search(self):
    
        self.assertFalse(add_search(""))

    def test_invalid_whitespace_search(self):
        self.assertFalse(add_search("   "))

        def test_boundary_valid_max_length_search(self):
            long_search = 'a' * 255
            self.assertTrue(add_search(long_search))

        def test_edge_long_search(self):
            long_search = 'a' * 256
            self.assertFalse(add_search(long_search))

        def test_invalid_none_input(self):
            self.assertFalse(add_search(None))

        if __name__ == '__main__':
            unittest.main()
