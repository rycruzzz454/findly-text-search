from search import search_text, utf16_length


def test_multiple_matches():
    result = search_text(
        "Automation helps. More automation.",
        "automation"
    )
    assert result["totalHits"] == 2
    assert result["hits"][0]["start"] == 0
    assert result["hits"][1]["text"] == "automation"


def test_case_sensitive():
    result = search_text(
        "Automation automation AUTOMATION",
        "automation",
        case_sensitive=True
    )
    assert result["totalHits"] == 1
    assert result["hits"][0]["text"] == "automation"


def test_literal_search():
    result = search_text("a.b a*b a.b", "a.b")
    assert result["totalHits"] == 2


def test_non_overlapping_matches():
    result = search_text("aaaaa", "aa")
    assert result["totalHits"] == 2


def test_multiline_positions():
    result = search_text(
        "Hello world\nFind the world",
        "world"
    )
    assert result["hits"][0]["line"] == 1
    assert result["hits"][0]["column"] == 7
    assert result["hits"][1]["line"] == 2
    assert result["hits"][1]["column"] == 10


def test_empty_query():
    result = search_text("Hello world", "")
    assert result["totalHits"] == 0


def test_invalid_input():
    try:
        search_text(123, "hello")
        assert False, "Expected ValueError"
    except ValueError:
        pass


def test_unicode_offsets():
    result = search_text("😀 hello", "hello")
    assert result["totalHits"] == 1
    assert result["hits"][0]["start"] == 3
    assert result["hits"][0]["column"] == 4
    assert utf16_length("😀") == 2


def test_ten_thousand_match_limit():
    result = search_text("a" * 10001, "a")
    assert result["totalHits"] == 10000
    assert result["truncated"] is True
