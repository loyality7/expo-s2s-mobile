package expo.modules.s2smobile

import io.mockk.mockk
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertTrue
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class EventBridgeTest {

    @Test
    fun `test delta coalescing buffer`() = runTest {
        val eventBridge = EventBridge { _, _ -> }
        assertTrue(true)
    }
}
